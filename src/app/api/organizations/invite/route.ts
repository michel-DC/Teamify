import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrganizationInvitationService } from "../../../../../emails/services";

/**
 * Route pour envoyer une invitation à rejoindre une organisation
 * Vérifie que l'utilisateur connecté est propriétaire ou admin de l'organisation
 * Génère un code d'invitation unique et envoie un email via Resend
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupération des informations complètes de l'utilisateur qui invite
    const invitingUser = await prisma.user.findUnique({
      where: { uid: user.uid },
      select: {
        firstname: true,
        lastname: true,
        email: true,
      },
    });

    if (!invitingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const { organizationPublicId, email } = await request.json();

    // Validation des données d'entrée
    if (!organizationPublicId || !email) {
      return NextResponse.json(
        { error: "organizationPublicId et email sont requis" },
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

    // Vérification que l'organisation existe via son publicId
    const organization = await prisma.organization.findUnique({
      where: { publicId: organizationPublicId },
      include: { organizationMembers: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Vérification que l'utilisateur est propriétaire ou membre avec rôle admin
    const isOwner = organization.ownerUid === user.uid;
    const isAdmin = organization.organizationMembers.some(
      (member) => member.userUid === user.uid && member.role === "ADMIN"
    );

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas les permissions pour inviter des membres" },
        { status: 403 }
      );
    }

    // Vérification si l'email invité correspond à un utilisateur déjà membre
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (invitedUser) {
      // Vérifier si cet utilisateur est déjà membre de l'organisation
      const existingMember = organization.organizationMembers.find(
        (member) => member.userUid === invitedUser.uid
      );

      if (existingMember) {
        return NextResponse.json(
          { error: "Cet utilisateur est déjà membre de l'organisation" },
          { status: 400 }
        );
      }
    }

    // Vérification qu'une invitation n'existe pas déjà pour cet email
    const existingInvite = await prisma.organizationInvite.findFirst({
      where: {
        organizationId: organization.id,
        email,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "Une invitation est déjà en attente pour cet email" },
        { status: 400 }
      );
    }

    // Extraction du nom du receveur de l'email
    const receiverName = email.split("@")[0];

    // Génération d'un code d'invitation de 30 caractères
    const generateInviteCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 30; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const inviteCode = generateInviteCode();

    // Création de l'invitation
    const invitation = await prisma.organizationInvite.create({
      data: {
        email,
        receiverName,
        organizationId: organization.id,
        invitedByUid: user.uid,
        inviteCode,
      },
    });

    // Formatage du nom de l'invitant
    const inviterName =
      `${invitingUser.firstname || ""} ${invitingUser.lastname || ""}`.trim() ||
      invitingUser.email;

    // Envoi de l'email via le service dédié
    const emailData = {
      organizationName: organization.name,
      organizationType: organization.organizationType,
      memberCount: organization.memberCount,
      mission: organization.mission,
      bio: organization.bio || undefined,
      inviteCode: invitation.inviteCode,
      inviterName,
    };

    const emailResult = await OrganizationInvitationService.sendInvitation(
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

    // Construire l'URL d'invitation pour les logs
    const inviteUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://teamify.onlinemichel.dev"
    }/invite/${invitation.inviteCode}`;

    console.log(
      `📧 Invitation envoyée par ${inviterName} à ${email} pour rejoindre ${organization.name}`
    );
    console.log(`🔗 Lien d'invitation: ${inviteUrl}`);

    return NextResponse.json({
      success: true,
      message: "Invitation envoyée avec succès",
      inviteCode: invitation.inviteCode,
      data: emailResult.data,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
