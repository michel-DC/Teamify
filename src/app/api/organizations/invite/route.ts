import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Envoi de l'email via Resend
    const inviteUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://onlinemichel.dev"
    }/invite/${invitation.inviteCode}`;

    // Formatage du nom de l'invitant
    const inviterName =
      `${invitingUser.firstname || ""} ${invitingUser.lastname || ""}`.trim() ||
      invitingUser.email;

    const { data, error } = await resend.emails.send({
      from: "Teamify <contact@onlinemichel.dev>",
      to: [email],
      subject: `Invitation à rejoindre ${organization.name}`,
      html: `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation à rejoindre l'organisation - Teamify</title>
    <style>
      body { margin:0; padding:0; background-color:#f9fafb; font-family: Arial, sans-serif; color:#020102; }
      table { border-spacing:0; border-collapse:collapse; }
      img { display:block; border:0; }
      a { text-decoration:none; }
      hr { border:none; height:2px; background:#FCA7DB; margin:30px 0; }
      @media screen and (max-width:600px) {
        .container { width:100% !important; }
        .content-padding { padding:20px !important; }
        h1 { font-size:20px !important; }
        p { font-size:14px !important; }
      }
    </style>
  </head>
  <body>
    <table role="presentation" width="100%" bgcolor="#f9fafb">
      <tr>
        <td align="center">
          <!-- Container -->
          <table role="presentation" width="600" class="container" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.05);">
            
            <!-- Logo -->
            <tr>
              <td align="center" style="padding:24px;">
                <img src="https://teamify.onlinemichel.dev/images/logo/teamify-logo.png" 
                     alt="Logo Teamify" 
                     width="160" 
                     style="display:block; max-width:80%; height:auto;">
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="content-padding" style="padding:32px 40px 20px; text-align:left;">
                <h1 style="font-size:24px; font-weight:700; margin:0 0 20px; color:#6D5DE6;">
                  Bonjour ${receiverName},
                </h1>
                <p style="font-size:16px; color:#4b5563; line-height:1.7; margin:0 0 30px;">
                  <strong>${inviterName}</strong> vous a invité à rejoindre une organisation sur <strong>Teamify</strong>.  
                  Nous sommes ravis de vous accueillir dans notre communauté.
                </p>
              </td>
            </tr>

            <!-- Separator -->
            <tr>
              <td style="padding:0 40px;">
                <hr>
              </td>
            </tr>

            <!-- Organization Section -->
            <tr>
              <td style="padding:20px 40px;">
                <table role="presentation" width="100%" style="border:1px solid #eee; border-radius:10px; background:#fafafa;" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:20px;">
                      <h2 style="font-size:18px; font-weight:600; margin:0 0 15px; color:#6D5DE6;">Détails de l'organisation</h2>
                      <p style="margin:0 0 6px; font-size:15px;"><strong>Organisation :</strong> ${
                        organization.name
                      }</p>
                      <p style="margin:0 0 6px; font-size:15px;"><strong>Type :</strong> ${
                        organization.organizationType
                      }</p>
                      <p style="margin:0 0 6px; font-size:15px;"><strong>Membres :</strong> ${
                        organization.memberCount
                      } membre${organization.memberCount > 1 ? "s" : ""}</p>
                      ${
                        organization.mission
                          ? `<p style="margin:0 0 6px; font-size:15px;"><strong>Mission :</strong> ${organization.mission}</p>`
                          : ""
                      }
                      ${
                        organization.bio
                          ? `<p style="margin:0 0 6px; font-size:15px;"><strong>Description :</strong> ${organization.bio}</p>`
                          : ""
                      }
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td align="center" style="padding:30px 40px 20px;">
                <a href="${inviteUrl}" 
                   style="display:inline-block; background-color:#6D5DE6; color:#ffffff; padding:14px 28px; border-radius:8px; font-weight:600; font-size:16px;">
                  Rejoindre l'organisation
                </a>
              </td>
            </tr>

            <!-- Secondary Note -->
            <tr>
              <td align="center" style="padding:10px 40px 40px;">
                <p style="margin:0; font-size:14px; color:#FCA7DB; font-weight:600;">
                  Invitation valable uniquement via ce lien
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:20px 40px; font-size:12px; color:#6b7280;">
                <p style="margin:0 0 6px;">
                  Vous recevez cet email car vous êtes invité sur <strong>Teamify</strong>.
                </p>
                <p style="margin:0;">
                  Consultez nos 
                  <a href="${
                    process.env.NEXT_PUBLIC_APP_URL ||
                    "https://teamify.onlinemichel.dev"
                  }/legal-mentions" style="color:#6D5DE6; font-weight:600;">mentions légales</a> 
                  et notre 
                  <a href="${
                    process.env.NEXT_PUBLIC_APP_URL ||
                    "https://teamify.onlinemichel.dev"
                  }/privacy-policy" style="color:#6D5DE6; font-weight:600;">politique de confidentialité</a>.
                </p>
              </td>
            </tr>

          </table>
          <!-- End Container -->
        </td>
      </tr>
    </table>
  </body>
</html>

      `,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    console.log(
      `📧 Invitation envoyée par ${inviterName} à ${email} pour rejoindre ${organization.name}`
    );
    console.log(`🔗 Lien d'invitation: ${inviteUrl}`);

    return NextResponse.json({
      success: true,
      message: "Invitation envoyée avec succès",
      inviteCode: invitation.inviteCode,
      data,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
