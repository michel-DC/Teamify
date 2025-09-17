import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * API pour supprimer une organisation
 * Permet aux propriétaires de marquer une organisation comme supprimée
 * et supprime tous les membres de l'organisation
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "ID de l'organisation requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire de l'organisation
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: parseInt(organizationId),
          userUid: currentUser.uid,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de cette organisation" },
        { status: 404 }
      );
    }

    if (membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Seul le propriétaire peut supprimer l'organisation" },
        { status: 403 }
      );
    }

    // Marquer l'organisation comme supprimée
    await prisma.organization.update({
      where: { id: parseInt(organizationId) },
      data: {
        isDeleted: true,
      },
    });

    // Supprimer tous les membres de l'organisation
    await prisma.organizationMember.deleteMany({
      where: {
        organizationId: parseInt(organizationId),
      },
    });

    return NextResponse.json({
      message: "Organisation supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'organisation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
