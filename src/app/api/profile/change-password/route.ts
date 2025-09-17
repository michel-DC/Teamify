import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Récupération de l'utilisateur connecté via JWT
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupération des données de la requête
    const { currentPassword, newPassword, confirmPassword } =
      await request.json();

    // Validation des champs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error: "Le nouveau mot de passe doit contenir au moins 8 caractères",
        },
        { status: 400 }
      );
    }

    // Récupération de l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { uid: currentUser.uid },
      select: {
        uid: true,
        password: true,
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

    // Vérification que l'utilisateur n'est pas connecté via Google
    if (user.googleId) {
      return NextResponse.json(
        {
          error: "Impossible de changer le mot de passe pour un compte Google",
        },
        { status: 400 }
      );
    }

    // Vérification que l'utilisateur a un mot de passe (pas de compte OAuth)
    if (!user.password) {
      return NextResponse.json(
        { error: "Ce compte n'a pas de mot de passe configuré" },
        { status: 400 }
      );
    }

    // Vérification du mot de passe actuel
    const isCurrentPasswordValid = await compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 400 }
      );
    }

    // Hashage du nouveau mot de passe
    const hashedNewPassword = await hash(newPassword, 12);

    // Mise à jour du mot de passe dans la base de données
    await prisma.user.update({
      where: { uid: user.uid },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json(
      { message: "Mot de passe mis à jour avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
