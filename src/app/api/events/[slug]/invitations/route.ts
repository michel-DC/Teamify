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
      body {
        margin: 0;
        padding: 0;
        background-color: #f9fafb;
        font-family: Arial, sans-serif;
        color: #020102;
      }
      table { border-spacing: 0; border-collapse: collapse; }
      img { display: block; border: 0; }
      a { text-decoration: none; }
      hr {
        border: none;
        height: 2px;
        background: #FCA7DB;
        margin: 30px 0;
      }
      @media screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .content-padding { padding: 20px !important; }
        h1 { font-size: 22px !important; }
        p { font-size: 14px !important; }
      }
    </style>
  </head>
  <body>
    <table role="presentation" width="100%" bgcolor="#f9fafb">
      <tr>
        <td align="center">
          <!-- Container -->
          <table role="presentation" width="600" class="container" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding:24px;">
                <img src="https://teamify.onlinemichel.dev/images/logo/teamify-logo.png"
                  alt="Teamify"
                  width="160"
                  style="display:block;">
              </td>
            </tr>

            <!-- Hero -->
            <tr>
              <td class="content-padding" style="padding:32px 40px 20px; text-align:left;">
                <h1 style="margin:0; font-size:24px; font-weight:700; color:#6D5DE6;">
                  Bonjour ${receiverName},
                </h1>
                <p style="margin:16px 0 0; font-size:16px; line-height:1.6; color:#020102;">
                  Vous avez été invité à participer à un événement organisé sur <strong>Teamify</strong>.  
                  Nous sommes ravis de vous compter parmi les participants.
                </p>
              </td>
            </tr>

            <!-- Separator -->
            <tr>
              <td style="padding:0 40px;">
                <hr>
              </td>
            </tr>

            <!-- Event Card -->
            <tr>
              <td style="padding:20px 40px;">
                <table role="presentation" width="100%" style="border:1px solid #eee; border-radius:10px; background:#fafafa;" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:20px;">
                      <h2 style="margin:0 0 15px; font-size:18px; font-weight:600; color:#6D5DE6;">Détails de l'événement</h2>
                      
                      <p style="margin:0 0 6px; font-size:15px;"><strong>Événement :</strong> ${eventName}</p>
                      <p style="margin:0 0 6px; font-size:15px;"><strong>Catégorie :</strong> ${eventCategory}</p>
                      ${
                        eventDate
                          ? `<p style="margin:0 0 6px; font-size:15px;"><strong>Date :</strong> ${eventDate}</p>`
                          : ""
                      }
                      ${
                        eventLocation
                          ? `<p style="margin:0 0 6px; font-size:15px;"><strong>Lieu :</strong> ${eventLocation}</p>`
                          : ""
                      }
                      <p style="margin:0 0 6px; font-size:15px;">
                        <strong>Participants :</strong> ${participantsCount} personne${
        participantsCount > 1 ? "s" : ""
      }
                      </p>
                      ${
                        truncatedDescription
                          ? `<p style="margin:12px 0 0; font-size:15px; color:#4b5563;"><strong>Description :</strong> ${truncatedDescription}</p>`
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
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://teamify.onlinemichel.dev"
                }/join-event?code=${invitationCode}"
                  style="display:inline-block; background-color:#6D5DE6; color:#ffffff; padding:14px 28px; border-radius:8px; font-size:16px; font-weight:600;">
                  Répondre à l'invitation
                </a>
              </td>
            </tr>

            <!-- Secondary Note in Rose -->
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
