export const baseEmailStyles = `
  body {
    margin: 0;
    padding: 0;
    background-color: #f9f9f9;
    font-family: Arial, sans-serif;
    color: #020102;
  }
  table { border-spacing: 0; border-collapse: collapse; }
  img { display: block; border: 0; }
  a { text-decoration: none; }
  h1 { font-size: 26px; line-height: 1.3; margin: 0; }
  p  { font-size: 16px; line-height: 1.6; margin: 0; color:#4b5563; }
  @media screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .content-padding { padding: 20px !important; }
    h1 { font-size: 22px !important; }
    p  { font-size: 14px !important; }
  }
`;

export const baseEmailHeader = `
  <table role="presentation" width="100%" bgcolor="#f9f9f9">
    <!-- Bandeau logo hors carte -->
    <tr>
      <td align="center" style="padding:24px 0 12px;">
        <table role="presentation" width="600" class="container" style="max-width:600px;">
          <tr>
            <td align="left" style="padding:0 16px;">
              <img src="https://teamify.onlinemichel.dev/images/logo/teamify-logo.png"
                   alt="Teamify"
                   width="120"
                   style="display:block;">
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Carte de contenu -->
    <tr>
      <td align="center" style="padding:12px 0 24px;">
        <table role="presentation" width="600" class="container" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.05);">
`;

export const baseEmailFooter = `
          <!-- Footer dans la carte-->
          <tr>
            <td align="center" style="padding:32px 32px 20px 32px; font-size:9px; color:#6b7280; background-color:#f9f9f9;">
              <!-- Logo centré en haut du footer -->
              <a href="https://teamify.onlinemichel.dev" style="display:inline-block; margin-bottom:16px;">
                <img src="https://teamify.onlinemichel.dev/images/logo/favicon-v2.png"
                     alt="Teamify"
                     width="80"
                     style="display:block; margin:0 auto;">
              </a>
              <p style="margin:0 0 10px 0; text-align:left;">
                Cet email a été envoyé automatiquement depuis la plateforme Teamify.<br>
                Si vous ne souhaitez plus recevoir d'invitations, veuillez nous contacter.
              </p>
              <p style="margin:0 0 10px 0; text-align:left;">
                <strong>Mentions légales :</strong> En utilisant cette invitation, vous acceptez les conditions d'utilisation de Teamify. Vos données personnelles sont traitées conformément à notre <a href="${
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://teamify.onlinemichel.dev"
                }/privacy-policy" style="color:#6D5DE6; font-weight:600;">politique de confidentialité</a>.
              </p>
              <p style="margin:0 0 10px 0; text-align:left;">
                <strong>Conditions d'utilisation :</strong> L'utilisation de cette page de réponse à invitation implique l'acceptation de nos <a href="${
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://teamify.onlinemichel.dev"
                }/terms" style="color:#6D5DE6; font-weight:600;">conditions générales d'utilisation</a>, disponibles sur notre site web.
              </p>
                <p style="margin:0; text-align:left;">
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
      </td>
    </tr>
  </table>
`;

export const baseEmailStructure = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teamify - Gestion d'événements</title>
    <style>
      ${baseEmailStyles}
    </style>
  </head>
  <body>
    ${baseEmailHeader}
    ${content}
    ${baseEmailFooter}
  </body>
</html>
`;
