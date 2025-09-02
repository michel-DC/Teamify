import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * Route API pour vérifier l'authentification de l'utilisateur actuel
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    return NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        profileImage: user.profileImage,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("[auth/me] Error", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
