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

    const organizations = await prisma.organization.findMany({
      where: {
        ownerId: user.id,
      },
    });

    return NextResponse.json({ organizations }, { status: 200 });
  } catch (error) {
    console.error("[API_ORG_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des organisations" },
      { status: 500 }
    );
  }
}
