import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    /**
     * Récupération de la première organisation de l'utilisateur
     */
    const organization = await prisma.organization.findFirst({
      where: {
        ownerUid: user.uid,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { organization: null, message: "Aucune organisation trouvée" },
        { status: 200 }
      );
    }

    return NextResponse.json({ organization }, { status: 200 });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération de l'organisation",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'organisation" },
      { status: 500 }
    );
  }
}
