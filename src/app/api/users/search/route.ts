import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    console.log(
      `[API] Recherche utilisateur par email: ${email} (par ${currentUser.email})`
    );

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      select: {
        uid: true,
        email: true,
        firstname: true,
        lastname: true,
        profileImage: true,
      },
    });

    if (!user) {
      console.log(`[API] Utilisateur non trouvé pour l'email: ${email}`);
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log(`[API] Utilisateur trouvé: ${user.firstname} ${user.lastname}`);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur recherche utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
