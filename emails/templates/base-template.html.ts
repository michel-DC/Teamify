export const baseEmailStyles = `
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
`;

export const baseEmailHeader = `
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
`;

export const baseEmailFooter = `
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
`;

export const baseEmailStructure = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email - Teamify</title>
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
