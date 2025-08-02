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

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organizations: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const userWithOrganizations = {
      ...userData,
      organization: userData.organizations[0] || null,
    };

    return NextResponse.json([userWithOrganizations], { status: 200 });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération des données",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
