import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { email, eventName, eventDate, eventLocation } = await request.json();

    // Validation des données
    if (!email || !eventName) {
      return NextResponse.json(
        { error: "Email et nom de l'événement requis" },
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
          <title>Invitation à l'événement</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .container {
              background-color: white;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .event-details {
              background-color: #f8fafc;
              border-radius: 6px;
              padding: 20px;
              margin: 20px 0;
            }
            .event-detail {
              margin: 10px 0;
              display: flex;
              align-items: center;
            }
            .event-detail strong {
              min-width: 80px;
              color: #374151;
            }
            .cta-button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Teamify</div>
              <h1 class="title">Vous êtes invité !</h1>
            </div>
            
            <p>Bonjour,</p>
            
            <p>Vous avez été invité à participer à un événement organisé sur Teamify.</p>
            
            <div class="event-details">
              <div class="event-detail">
                <strong>Événement :</strong>
                <span>${eventName}</span>
              </div>
              ${
                eventDate
                  ? `
              <div class="event-detail">
                <strong>Date :</strong>
                <span>${eventDate}</span>
              </div>
              `
                  : ""
              }
              ${
                eventLocation
                  ? `
              <div class="event-detail">
                <strong>Lieu :</strong>
                <span>${eventLocation}</span>
              </div>
              `
                  : ""
              }
            </div>
            
            <p>Pour accepter ou décliner cette invitation, veuillez cliquer sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/events/${slug}/invitations" class="cta-button">
                Répondre à l'invitation
              </a>
            </div>
            
            <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #2563eb;">
              ${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/events/${slug}/invitations
            </p>
            
            <div class="footer">
              <p>Cet email a été envoyé depuis Teamify</p>
              <p>Si vous ne souhaitez plus recevoir d'invitations, veuillez nous contacter.</p>
            </div>
          </div>
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
