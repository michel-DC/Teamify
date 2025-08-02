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
      select: {
        profileImage: true,
      },
    });

    return NextResponse.json(
      { profileImage: organization?.profileImage || null },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération de l'image de profil",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'image" },
      { status: 500 }
    );
  }
}
