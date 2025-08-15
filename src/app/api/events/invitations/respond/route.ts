import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeInvitationCode } from "@/lib/invitation-utils";

/**
 * @param Traitement de la réponse à une invitation
 *
 * Met à jour le statut de l'invitation et enregistre la date de réponse
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationId: invitationCode, status } = body;

    // Validation des données
    if (!invitationCode || !status) {
      return NextResponse.json(
        { error: "Code d'invitation et statut requis" },
        { status: 400 }
      );
    }

    if (!["ACCEPTED", "DECLINED"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide. Doit être ACCEPTED ou DECLINED" },
        { status: 400 }
      );
    }

    // Décoder le code d'invitation
    const decodedCode = decodeInvitationCode(invitationCode);

    if (!decodedCode) {
      return NextResponse.json(
        { error: "Format de code d'invitation invalide" },
        { status: 400 }
      );
    }

    const { invitationId, eventCode } = decodedCode;

    // Vérifier que l'invitation existe et n'a pas déjà été répondue
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        invitationId,
        eventCode,
      },
      include: {
        event: true,
      },
    });

    if (!existingInvitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée" },
        { status: 404 }
      );
    }

    if (existingInvitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été répondue" },
        { status: 409 }
      );
    }

    // Vérifier que l'événement existe et n'est pas annulé
    if (!existingInvitation.event || existingInvitation.event.isCancelled) {
      return NextResponse.json(
        { error: "Cet événement n'est plus disponible" },
        { status: 404 }
      );
    }

    // Mettre à jour l'invitation
    const updatedInvitation = await prisma.invitation.update({
      where: { id: existingInvitation.id },
      data: {
        status,
        respondedAt: new Date(),
      },
    });

    console.log(
      `[Invitation] Réponse enregistrée: ${existingInvitation.id} -> ${status}`
    );

    return NextResponse.json({
      success: true,
      message: `Invitation ${
        status === "ACCEPTED" ? "acceptée" : "déclinée"
      } avec succès`,
      invitation: {
        id: updatedInvitation.id,
        status: updatedInvitation.status,
        respondedAt: updatedInvitation.respondedAt,
      },
    });
  } catch (error) {
    console.error("Erreur réponse invitation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
