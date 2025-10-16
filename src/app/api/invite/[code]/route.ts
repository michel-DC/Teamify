import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createNotificationForOrganizationOwnersAndAdmins } from "@/lib/notification-service";

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
        invitedBy: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée ou invalide" },
        { status: 404 }
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été traitée" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user?.uid) {
      const signupUrl = `/auth/register?invite=${code}`;
      return NextResponse.json({
        redirect: true,
        url: signupUrl,
        message: "Redirection vers l'inscription",
      });
    }

    const userUid = user.uid;

    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: invitation.organizationId,
          userUid,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Vous êtes déjà membre de cette organisation" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.organizationMember.create({
        data: {
          userUid,
          organizationId: invitation.organizationId,
          role: "MEMBER",
        },
      });

      await tx.organizationInvite.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      await tx.organization.update({
        where: { id: invitation.organizationId },
        data: {
          memberCount: {
            increment: 1,
          },
        },
      });

      const groupConversation = await tx.conversation.findFirst({
        where: {
          type: "GROUP",
          organizationId: invitation.organizationId,
        },
      });

      if (groupConversation) {
        await tx.conversationMember.create({
          data: {
            conversationId: groupConversation.id,
            userId: userUid,
            role: "MEMBER",
          },
        });
      }
    });

    try {
      await createNotificationForOrganizationOwnersAndAdmins(
        invitation.organizationId,
        {
          notificationName: "Nouveau membre rejoint l'organisation",
          notificationDescription: `${
            user.firstname || user.email
          } a rejoint l'organisation "${invitation.organization.name}".`,
          notificationType: "INFO",
        }
      );

      console.log(
        `Notifications créées pour les OWNER/ADMIN de l'organisation ${invitation.organizationId} - nouveau membre: ${userUid}`
      );
    } catch (notificationError) {
      console.error(
        "Erreur lors de la création des notifications pour les OWNER/ADMIN:",
        notificationError
      );
    }

    const dashboardUrl = `/dashboard/organizations`;

    return NextResponse.json({
      success: true,
      message: `Vous avez rejoint ${invitation.organization.name} avec succès`,
      redirect: true,
      url: dashboardUrl,
    });
  } catch (error) {
    console.error("Erreur lors du traitement de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { action } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code d'invitation requis" },
        { status: 400 }
      );
    }

    if (action !== "decline") {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const invitation = await prisma.organizationInvite.findUnique({
      where: { inviteCode: code },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée ou invalide" },
        { status: 404 }
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été traitée" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user?.uid) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour refuser une invitation" },
        { status: 401 }
      );
    }

    await prisma.organizationInvite.update({
      where: { id: invitation.id },
      data: { status: "DECLINED" },
    });

    return NextResponse.json({
      success: true,
      message: `Vous avez refusé l'invitation à rejoindre ${invitation.organization.name}`,
    });
  } catch (error) {
    console.error("Erreur lors du refus de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
