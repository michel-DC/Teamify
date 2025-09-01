import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encodeInvitationCode } from "@/lib/invitation-utils";
import { EventInvitationService } from "../../../../../../emails/services";

/**
 * @param Envoi d'une nouvelle invitation
 *
 * Crée une nouvelle invitation et envoie l'email
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { email, eventName, eventDate, eventLocation } = body;

    // Validation des données
    if (!email || !eventName) {
      return NextResponse.json(
        { error: "Email et nom d'événement requis" },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement appartient à l'utilisateur et récupérer les détails
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
        ownerUid: user.uid,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer le nombre de participants depuis la colonne capacity
    const participantsCount = event.capacity || 0;
    const eventCategory = event.category || "Général";
    const eventDescription = event.description || "";
    const truncatedDescription =
      eventDescription.length > 200
        ? eventDescription.substring(0, 200) + "..."
        : eventDescription;

    // Vérifier si l'invitation existe déjà
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        eventCode: event.eventCode,
        receiverEmail: email,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Une invitation a déjà été envoyée à cette adresse email" },
        { status: 409 }
      );
    }

    // Extraire le nom du receveur de l'email
    const receiverName = email.split("@")[0];

    console.log("[Invitation] Données à créer:", {
      eventCode: event.eventCode,
      receiverName,
      receiverEmail: email,
      status: "PENDING",
    });

    // Créer l'invitation en base de données
    const invitation = await prisma.invitation.create({
      data: {
        eventCode: event.eventCode,
        receiverName,
        receiverEmail: email,
        status: "PENDING",
        sentAt: new Date(),
      },
    });

    // Générer le code d'invitation unique avec l'invitationId généré automatiquement
    const invitationCode = encodeInvitationCode(
      invitation.invitationId!,
      event.eventCode
    );

    console.log("[Invitation] Invitation créée:", invitation);

    /**
     * @param Envoi de l'email d'invitation via le service dédié
     */
    const emailData = {
      eventName,
      eventCategory,
      eventDate,
      eventLocation,
      participantsCount,
      description: truncatedDescription,
      invitationCode,
    };

    const emailResult = await EventInvitationService.sendInvitation(
      email,
      receiverName,
      emailData
    );

    if (!emailResult.success) {
      console.error("Erreur envoi email:", emailResult.error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Invitation envoyée avec succès",
        data: emailResult.data,
        invitation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur API invitations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
