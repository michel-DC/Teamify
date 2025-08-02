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

    const organization = await prisma.organization.findFirst({
      where: {
        ownerId: user.id,
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
    console.error("[API_ORG_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'organisation" },
      { status: 500 }
    );
  }
}
