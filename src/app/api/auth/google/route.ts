import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { serialize } from "cookie";
import type {
  GoogleAuthRequest,
  GoogleUserInfo,
  GoogleTokenResponse,
} from "@/types/google-auth";

/**
 * Route API pour l'authentification Google OAuth
 * Gère la connexion et l'inscription via Google
 */
export async function POST(req: Request) {
  const start = Date.now();

  try {
    const body = await req.json();
    const { code }: GoogleAuthRequest = body;

    if (!code) {
      return NextResponse.json(
        { error: "Code d'autorisation requis" },
        { status: 400 }
      );
    }

    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("[google-auth] Token exchange failed", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
      });
      return NextResponse.json(
        { error: "Échec de l'authentification Google" },
        { status: 400 }
      );
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    const { access_token } = tokenData;

    // Récupérer les informations de l'utilisateur
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error("[google-auth] User info fetch failed", {
        status: userResponse.status,
        statusText: userResponse.statusText,
      });
      return NextResponse.json(
        { error: "Impossible de récupérer les informations utilisateur" },
        { status: 400 }
      );
    }

    const googleUser: GoogleUserInfo = await userResponse.json();

    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: googleUser.email }, { googleId: googleUser.id }],
      },
    });

    if (user) {
      // Cas 1: Utilisateur existant → connexion

      // Mettre à jour les informations Google si nécessaire
      if (!user.googleId) {
        await prisma.user.update({
          where: { uid: user.uid },
          data: {
            googleId: googleUser.id,
            profileImage: googleUser.picture,
            updatedAt: new Date(),
          },
        });
      }
    } else {
      // Cas 2: Nouvel utilisateur → création

      // Générer un mot de passe sécurisé pour les utilisateurs Google
      const securePassword = `google_${
        googleUser.id
      }_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          firstname:
            googleUser.given_name || googleUser.name?.split(" ")[0] || "",
          lastname:
            googleUser.family_name ||
            googleUser.name?.split(" ").slice(1).join(" ") ||
            "",
          password: securePassword, // Mot de passe sécurisé pour les utilisateurs Google
          googleId: googleUser.id,
          profileImage: googleUser.picture,
        },
      });
    }

    // Générer le token JWT
    const token = await generateToken(user.uid);

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    // Vérifier si l'utilisateur a une organisation
    const organizationsCount = await prisma.organization.count({
      where: { ownerUid: user.uid },
    });

    const hasOrganization = organizationsCount > 0;

    const responseData = {
      message: "Connexion Google réussie",
      user: {
        uid: user.uid,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        profileImage: user.profileImage,
      },
      hasOrganization,
    };

    const response = NextResponse.json(responseData);
    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'authentification Google" },
      { status: 500 }
    );
  }
}
