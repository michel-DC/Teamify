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
    h2 { font-size:18px !important; }
    h3 { font-size:16px !important; }
    p, li { font-size:14px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f9fafb;">

<table role="presentation" width="100%" bgcolor="#f9fafb">
<tr>
<td align="center">

<!-- Container -->
<table role="presentation" width="600" class="container" style="max-width:600px; background-color:#ffffff;">

  <!-- Header -->
  <tr>
    <td align="center" style="background:linear-gradient(135deg,#7c3aed,#6d28d9); padding:40px 30px;">
      <h1 style="color:#fff; margin:0; font-size:40px; font-weight:bold;">Teamify</h1>
      <p style="color:#fff; font-size:16px; margin:8px 0 0; opacity:0.9; font-weight:300;">
        Organisez vos événements en équipe
      </p>
    </td>
  </tr>

  <!-- Content -->
  <tr>
    <td class="content-padding" style="padding:40px 30px; color:#1f2937;">

      <h1 style="font-size:24px; font-weight:600; color:#1f2937; margin:0 0 20px;">Bonjour ${receiverName}</h1>

      <p style="font-size:16px; color:#4b5563; line-height:1.7; margin:0 0 30px;">
        Vous avez été invité à participer à un événement organisé sur Teamify. 
        Nous sommes ravis de vous compter parmi les participants !
      </p>

      <!-- Event Section -->
      <table role="presentation" width="100%" style="background:linear-gradient(135deg,#f8fafc,#e2e8f0); border-radius:12px; border-left:4px solid #2563eb; margin:30px 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:30px;">
            <h2 style="font-size:20px; font-weight:600; color:#1f2937; margin:0 0 20px;">Détails de l'événement</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:5px 0; font-size:15px; color:#4b5563;"><strong>Événement :</strong> ${eventName}</td>
              </tr>
              <tr>
                <td style="padding:5px 0; font-size:15px; color:#4b5563;"><strong>Catégorie :</strong> ${eventCategory}</td>
              </tr>
              ${
                eventDate
                  ? `
              <tr>
                <td style="padding:5px 0; font-size:15px; color:#4b5563;"><strong>Date :</strong> ${eventDate}</td>
              </tr>`
                  : ""
              }
              ${
                eventLocation
                  ? `
              <tr>
                <td style="padding:5px 0; font-size:15px; color:#4b5563;"><strong>Lieu :</strong> ${eventLocation}</td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding:5px 0; font-size:15px; color:#4b5563;">
                  <strong>Participants :</strong> ${participantsCount} personne${
        participantsCount > 1 ? "s" : ""
      }
                </td>
              </tr>
              ${
                truncatedDescription
                  ? `
              <tr>
                <td style="padding:5px 0; font-size:15px; color:#4b5563;"><strong>Description :</strong> ${truncatedDescription}</td>
              </tr>`
                  : ""
              }
            </table>
          </td>
        </tr>
      </table>

      <!-- Instructions -->
      <table role="presentation" width="100%" style="background-color:#f3f4f6; border:1px solid #7c3aed; border-radius:8px; margin:30px 0;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:25px;">
            <h3 style="font-size:18px; font-weight:600; color:#7c3aed; margin:0 0 15px;">Comment répondre à cette invitation ?</h3>
            <ul style="list-style:none; padding:0; margin:0; color:#4b5563; font-size:14px;">
              <li style="margin:10px 0;">✓ Cliquez sur le bouton "Répondre à l'invitation" ci-dessous</li>
              <li style="margin:10px 0;">✓ Vous serez redirigé vers une page sécurisée de Teamify</li>
              <li style="margin:10px 0;">✓ Choisissez d'accepter ou de décliner l'invitation</li>
              <li style="margin:10px 0;">✓ Votre réponse sera automatiquement transmise à l'organisateur</li>
              <li style="margin:10px 0;">✓ Vous recevrez une confirmation par email</li>
            </ul>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <div style="text-align:center; margin:40px 0;">
        <a href="${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/join-event?code=${invitationCode}" 
           style="display:inline-block; background:linear-gradient(135deg,#7c3aed,#6d28d9); color:#fff; padding:16px 32px; border-radius:8px; font-weight:600; font-size:16px;">
           Répondre à l'invitation
        </a>
      </div>

      <!-- Alternative Link -->
      <div style="margin-top:20px; padding:15px; background-color:#f3f4f6; border-radius:6px; border:1px solid #d1d5db;">
        <p style="font-size:14px; color:#6b7280; margin:0 0 8px;"><strong>Le bouton ne fonctionne pas ?</strong></p>
        <p style="font-size:14px; color:#6b7280; margin:0 0 8px;">Copiez et collez ce lien dans votre navigateur :</p>
        <a href="${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/join-event?code=${invitationCode}" 
           style="color:#7c3aed; word-break:break-all; font-size:13px;">
           ${
             process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
           }/join-event?code=${invitationCode}
        </a>
      </div>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td align="center" style="background-color:#1f2937; color:#9ca3af; padding:30px; font-size:14px; line-height:1.6;">
      <div style="max-width:500px; margin:0 auto;">
        <h4 style="font-size:18px; font-weight:600; color:#f9fafb; margin:0 0 20px;">Teamify</h4>
        <p style="margin:0 0 15px;">Cet email a été envoyé automatiquement depuis la plateforme Teamify. 
        Si vous ne souhaitez plus recevoir d'invitations, veuillez nous contacter.</p>
        <p style="margin:0 0 15px;"><strong>Mentions légales :</strong> En utilisant cette invitation, vous acceptez les conditions d'utilisation de Teamify. 
        Vos données personnelles sont traitées conformément à notre politique de confidentialité.</p>
        <p style="margin:0 0 15px;"><strong>Conditions d'utilisation :</strong> L'utilisation de cette page de réponse à invitation implique l'acceptation 
        de nos conditions générales d'utilisation, disponibles sur notre site web.</p>
        <div style="margin-top:20px; padding-top:20px; border-top:1px solid #374151;">
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/mentions-legales" style="color:#a78bfa; margin:0 10px; font-size:13px;">Mentions légales</a>
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/conditions-utilisation" style="color:#a78bfa; margin:0 10px; font-size:13px;">Conditions d'utilisation</a>
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/politique-confidentialite" style="color:#a78bfa; margin:0 10px; font-size:13px;">Politique de confidentialité</a>
        </div>
      </div>
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
