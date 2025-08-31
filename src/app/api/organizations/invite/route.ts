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
         body { margin:0; padding:0; background-color:#f9fafb; font-family: Arial, sans-serif; }
         table { border-spacing:0; border-collapse:collapse; }
         img { display:block; border:0; }
         a { text-decoration:none; }
         @media screen and (max-width:600px) {
         .container { width:100% !important; }
         .content-padding { padding:20px !important; }
         h1 { font-size:20px !important; }
         p { font-size:14px !important; }
         }
      </style>
   </head>
   <body style="margin:0; padding:0; background-color:#f9fafb;">
      <table role="presentation" width="100%" bgcolor="#f9fafb">
         <tr>
            <td align="center">
               <!-- Container -->
               <table role="presentation" width="600" class="container" style="max-width:600px; background-color:#ffffff;">
                  <!-- Logo -->
                  <tr>
                     <td align="center" style="padding:20px 0; background-color:#ffffff;">
                        <img src="https://teamify.onlinemichel.dev/images/logo/teamify-logo.png" 
                        alt="Logo Teamify" 
                        width="200" 
                        style="display:block; width:200px; max-width:80%; height:auto;">
                     </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                     <td class="content-padding" style="padding:30px; color:#1f2937; text-align:left;">
                        <h1 style="font-size:24px; font-weight:600; margin:0 0 20px;">Bonjour ${receiverName}</h1>
                        <p style="font-size:16px; color:#4b5563; line-height:1.7; margin:0 0 30px;">
                           <strong>${inviterName}</strong> vous a invité à rejoindre une organisation sur Teamify. 
                           Nous sommes ravis de vous accueillir dans notre communauté !
                        </p>
                        <!-- Organization Section -->
                        <table role="presentation" width="100%" style="background-color:#f8fafc; border-radius:8px; border-left:4px solid #4a148c; margin-bottom:30px;" cellpadding="0" cellspacing="0">
                           <tr>
                              <td style="padding:20px;">
                                 <h2 style="font-size:20px; font-weight:600; margin:0 0 15px;">Détails de l'organisation</h2>
                                 <p style="margin:0; font-size:15px;"><strong>Organisation :</strong> ${
                                   organization.name
                                 }</p>
                                 <p style="margin:0; font-size:15px;"><strong>Type :</strong> ${
                                   organization.organizationType
                                 }</p>
                                 <p style="margin:0; font-size:15px;"><strong>Membres :</strong> ${
                                   organization.memberCount
                                 } membre${
        organization.memberCount > 1 ? "s" : ""
      }</p>
                                 ${
                                   organization.mission
                                     ? `<p style="margin:0; font-size:15px;"><strong>Mission :</strong> ${organization.mission}</p>`
                                     : ""
                                 }
                                 ${
                                   organization.bio
                                     ? `<p style="margin:0; font-size:15px;"><strong>Description :</strong> ${organization.bio}</p>`
                                     : ""
                                 }
                              </td>
                           </tr>
                        </table>
                        
                        <!-- CTA Button -->
                        <div style="text-align:center; margin:30px 0;">
                           <a href="${inviteUrl}" 
                           style="display:inline-block; background-color:#4a148c; color:#fff; padding:14px 28px; border-radius:6px; font-weight:600; font-size:16px;">
                           Rejoindre l'organisation
                           </a>
                        </div>
                     </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                     <td align="center" style="padding:20px; background-color:#f9fafb; font-size:12px; color:#9ca3af;">
                        <img src="https://teamify.onlinemichel.dev/images/logo/favicon.svg" alt="Favicon" width="24" style="margin-bottom:10px;">
                        <p style="margin:0;">Vous recevez cet email car vous êtes invité sur Teamify. 
                           Consultez nos <a href="${
                             process.env.NEXT_PUBLIC_APP_URL ||
                             "https://teamify.onlinemichel.dev"
                           }/mentions-legales" style="color:#4a148c;">mentions légales</a> et notre <a href="${
        process.env.NEXT_PUBLIC_APP_URL || "https://teamify.onlinemichel.dev"
      }/politique-confidentialite" style="color:#4a148c;">politique de confidentialité</a>.
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
