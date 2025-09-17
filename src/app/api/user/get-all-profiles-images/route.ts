import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupération des paramètres de requête
    const { searchParams } = new URL(request.url);
    const userUids = searchParams.get("userUids");

    if (!userUids) {
      return NextResponse.json({ error: "userUids requis" }, { status: 400 });
    }

    // Conversion de la chaîne en tableau
    const uidArray = userUids.split(",");

    // Récupération des utilisateurs avec leurs photos de profil
    const users = await prisma.user.findMany({
      where: {
        uid: {
          in: uidArray,
        },
      },
      select: {
        uid: true,
        profileImage: true,
      },
    });

    // Formatage des données pour le frontend
    const profileImages = users.map(
      (userData: { uid: string; profileImage: string | null }) => ({
        uid: userData.uid,
        profileImage: userData.profileImage,
      })
    );

    return NextResponse.json({ profileImages });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des photos de profil:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
