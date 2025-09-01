import { OrganizationInvitationData } from "../types/email.types";
import { baseEmailStructure } from "./base-template.html";

export const generateOrganizationInvitationEmail = (
  data: OrganizationInvitationData,
  receiverName: string
): string => {
  const content = `
          <!-- Content -->
          <tr>
            <td class="content-padding" style="padding:32px 40px 20px; text-align:left;">
              <h1 style="font-size:24px; font-weight:700; margin:0 0 20px; color:#6D5DE6;">
                Bonjour ${receiverName},
              </h1>
              <p style="font-size:16px; color:#4b5563; line-height:1.7; margin:0 0 30px;">
                <strong>${
                  data.inviterName
                }</strong> vous a invité à rejoindre une organisation sur <strong>Teamify</strong>.  
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
                      data.organizationName
                    }</p>
                    <p style="margin:0 0 6px; font-size:15px;"><strong>Type :</strong> ${
                      data.organizationType
                    }</p>
                    <p style="margin:0 0 6px; font-size:15px;"><strong>Membres :</strong> ${
                      data.memberCount
                    } membre${data.memberCount > 1 ? "s" : ""}</p>
                    ${
                      data.mission
                        ? `<p style="margin:0 0 6px; font-size:15px;"><strong>Mission :</strong> ${data.mission}</p>`
                        : ""
                    }
                    ${
                      data.bio
                        ? `<p style="margin:0 0 6px; font-size:15px;"><strong>Description :</strong> ${data.bio}</p>`
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
              }/invite/${data.inviteCode}" 
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
  `;

  return baseEmailStructure(content);
};
