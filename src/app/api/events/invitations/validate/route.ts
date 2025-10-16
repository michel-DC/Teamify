import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeInvitationCode } from "@/lib/invitation-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Code d'invitation requis" },
        { status: 400 }
      );
    }

    const correctedCode = code.replace(/\s/g, "+");

    const decodedCode = decodeInvitationCode(correctedCode);

    if (!decodedCode) {
      return NextResponse.json(
        { error: "Format de code d'invitation invalide" },
        { status: 400 }
      );
    }

    const { invitationId, eventCode } = decodedCode;

    const invitation = await prisma.invitation.findFirst({
      where: {
        invitationId,
        eventCode,
      },
      include: {
        event: {
          include: {
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée ou expirée" },
        { status: 404 }
      );
    }

    if (!invitation.event || invitation.event.isCancelled) {
      return NextResponse.json(
        { error: "Cet événement n'est plus disponible" },
        { status: 404 }
      );
    }

    const eventDetails = {
      id: invitation.event.id,
      title: invitation.event.title,
      description: invitation.event.description,
      startDate: invitation.event.startDate?.toISOString(),
      endDate: invitation.event.endDate?.toISOString(),
      location: invitation.event.location,
      capacity: invitation.event.capacity,
      imageUrl: invitation.event.imageUrl,
      organization: {
        name: invitation.event.organization.name,
      },
    };

    const invitationDetails = {
      id: invitation.id,
      invitationId: invitation.invitationId!,
      receiverName: invitation.receiverName,
      receiverEmail: invitation.receiverEmail,
      status: invitation.status,
      eventCode: invitation.eventCode,
    };

    return NextResponse.json({
      event: eventDetails,
      invitation: invitationDetails,
    });
  } catch (error) {
    console.error("Erreur validation invitation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
