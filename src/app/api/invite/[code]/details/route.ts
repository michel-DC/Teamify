import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: "Code d'invitation requis" },
        { status: 400 }
      );
    }

    const invitation = await prisma.organizationInvite.findUnique({
      where: { inviteCode: code },
      include: {
        organization: true,
        invitedBy: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée ou invalide" },
        { status: 404 }
      );
    }

    // Vérification du statut de l'invitation
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été traitée" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
          bio: invitation.organization.bio,
          organizationType: invitation.organization.organizationType,
          memberCount: invitation.organization.memberCount,
          mission: invitation.organization.mission,
        },
        invitedBy: invitation.invitedBy,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de l'invitation:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
