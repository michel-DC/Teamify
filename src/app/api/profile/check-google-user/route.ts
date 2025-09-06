import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Récupération de l'utilisateur connecté via JWT
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupération de l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { uid: currentUser.uid },
      select: {
        googleId: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Retourne si l'utilisateur est un utilisateur Google
    return NextResponse.json(
      {
        isGoogleUser: !!user.googleId,
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'utilisateur Google:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
