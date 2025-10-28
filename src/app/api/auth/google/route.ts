import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { serialize } from "cookie";
import type {
  GoogleAuthRequest,
  GoogleUserInfo,
  GoogleTokenResponse,
} from "@/types/google-auth";

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

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return NextResponse.json(
        { error: "Échec de l'authentification Google" },
        { status: 400 }
      );
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    const { access_token } = tokenData;

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return NextResponse.json(
        { error: "Impossible de récupérer les informations utilisateur" },
        { status: 400 }
      );
    }

    const googleUser: GoogleUserInfo = await userResponse.json();

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: googleUser.email }, { googleId: googleUser.id }],
      },
    });

    if (user) {
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
          password: securePassword,
          googleId: googleUser.id,
          profileImage: googleUser.picture,
        },
      });
    }

    const token = await generateToken(user.uid);

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

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
