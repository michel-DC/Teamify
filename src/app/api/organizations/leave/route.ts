import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    if (membership.role === "OWNER") {
      return NextResponse.json(
        {
          error:
            "Le propriétaire ne peut pas quitter l'organisation. Transférez d'abord la propriété ou supprimez l'organisation.",
        },
        { status: 403 }
      );
    }

    await prisma.organizationMember.delete({
      where: {
        organizationId_userUid: {
          organizationId: parseInt(organizationId),
          userUid: currentUser.uid,
        },
      },
    });

    await prisma.organization.update({
      where: { id: parseInt(organizationId) },
      data: {
        memberCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({
      message: "Vous avez quitté l'organisation avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la sortie de l'organisation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
