import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  /**
   * Récupération de l'utilisateur connecté
   */
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    /**
     * Récupération des organisations appartenant à l'utilisateur
     * Utilise directement le champ eventCount au lieu de récupérer tous les événements
     */
    const organizations = await prisma.organization.findMany({
      where: { ownerUid: user.uid },
      select: {
        id: true,
        publicId: true,
        name: true,
        bio: true,
        profileImage: true,
        memberCount: true,
        organizationType: true,
        mission: true,
        eventCount: true,
        createdAt: true,
        location: true,
      },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération des organisations",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
