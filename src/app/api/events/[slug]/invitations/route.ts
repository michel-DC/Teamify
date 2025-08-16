import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Resend } from "resend";
import { encodeInvitationCode } from "@/lib/invitation-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

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
     * @param Envoi de l'email d'invitation via Resend
     *
     * Utilise le template HTML pour créer un email d'invitation professionnel
     */
    const { data, error } = await resend.emails.send({
      from: "Teamify <contact@onlinemichel.dev>",
      to: [email],
      subject: `Invitation à l'événement : ${eventName}`,
      html: `
<!DOCTYPE html>
<html lang="fr">
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation à l'événement - Teamify</title>
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
                        <img src="${
                          process.env.NEXT_PUBLIC_APP_URL ||
                          "https://teamify.onlinemichel.dev"
                        }/images/logo/teamify-logo.png" 
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
                           Vous avez été invité à participer à un événement organisé sur Teamify. 
                           Nous sommes ravis de vous compter parmi les participants !
                        </p>
                        <!-- Event Section -->
                        <table role="presentation" width="100%" style="background-color:#f8fafc; border-radius:8px; border-left:4px solid #4a148c; margin-bottom:30px;" cellpadding="0" cellspacing="0">
                           <tr>
                              <td style="padding:20px;">
                                 <h2 style="font-size:20px; font-weight:600; margin:0 0 15px;">Détails de l'événement</h2>
                                 <p style="margin:0; font-size:15px;"><strong>Événement :</strong> ${eventName}</p>
                                 <br/>
                                 <p style="margin:0; font-size:15px;"><strong>Catégorie :</strong> ${eventCategory}</p>
                                 <br/>
                                 ${
                                   eventDate
                                     ? `
                                 <p style="margin:0; font-size:15px;"><strong>Date :</strong> ${eventDate}</p>
                                 `
                                     : ""
                                 }
                                     <br/>
                                 ${
                                   eventLocation
                                     ? `
                                 <p style="margin:0; font-size:15px;"><strong>Lieu :</strong> ${eventLocation}</p>
                                 `
                                     : ""
                                 }
                                 <br/>
                                 <p style="margin:0; font-size:15px;"><strong>Participants :</strong> ${participantsCount} personne${
        participantsCount > 1 ? "s" : ""
      }
                                 </p>
                                 <br/>
                                  ${
                                    truncatedDescription
                                      ? `
                                 <p style="margin:0; font-size:15px;"><strong>Description :</strong> ${truncatedDescription}</p>
                                 `
                                      : ""
                                  }
                              </td>
                           </tr>
                        </table>
                        <!-- CTA Button -->
                        <div style="text-align:center; margin:30px 0;">
                           <a href="${
                             process.env.NEXT_PUBLIC_APP_URL ||
                             "https://teamify.onlinemichel.dev"
                           }/join-event?code=${invitationCode}" 
                           style="display:inline-block; background-color:#4a148c; color:#fff; padding:14px 28px; border-radius:6px; font-weight:600; font-size:16px;">
                           Répondre à l'invitation
                           </a>
                        </div>
                     </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                     <td align="center" style="padding:20px; background-color:#f9fafb; font-size:12px; color:#9ca3af;">
                        <img src="${
                          process.env.NEXT_PUBLIC_APP_URL ||
                          "https://teamify.onlinemichel.dev"
                        }/images/logo/teamify-favicon.png" alt="Favicon" width="24" style="margin-bottom:10px;">
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

    return NextResponse.json(
      {
        success: true,
        message: "Invitation envoyée avec succès",
        data,
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
