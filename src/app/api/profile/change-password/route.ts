import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } =
      await request.json();

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

    if (user.googleId) {
      return NextResponse.json(
        {
          error: "Impossible de changer le mot de passe pour un compte Google",
        },
        { status: 400 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Ce compte n'a pas de mot de passe configuré" },
        { status: 400 }
      );
    }

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

    const hashedNewPassword = await hash(newPassword, 12);

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
