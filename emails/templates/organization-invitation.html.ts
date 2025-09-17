import { OrganizationInvitationData } from "../types/email.types";
import { baseEmailStructure } from "./base-template.html";

export const generateOrganizationInvitationEmail = (
  data: OrganizationInvitationData,
  receiverName: string
): string => {
  const content = `
          <!-- Contenu carte -->
          <tr>
            <td class="content-padding" style="padding:32px; text-align:left; background:#ffffff;">
              <h1 style="margin:0 0 16px; color:#020102;">Bonjour ${receiverName},</h1>
              <p style="margin:0 0 24px;">
                <strong>${
                  data.inviterName
                }</strong> vous a invité à rejoindre une organisation sur <strong>Teamify</strong>.
              </p>

              <!-- Détails (même background que la carte, pas de sous-card grisée) -->
              <div style="margin:0 0 24px;">
                <p style="margin:0 0 8px;"><strong>Organisation :</strong> ${
                  data.organizationName
                }</p>
                <p style="margin:0 0 8px;"><strong>Type :</strong> ${
                  data.organizationType
                }</p>
                <p style="margin:0 0 8px;"><strong>Membres :</strong> ${
                  data.memberCount
                } membre${data.memberCount > 1 ? "s" : ""}</p>
                ${
                  data.mission
                    ? `<p style="margin:0 0 8px;"><strong>Mission :</strong> ${data.mission}</p>`
                    : ""
                }
                ${
                  data.bio
                    ? `<p style="margin:0 0 8px;"><strong>Description :</strong> ${data.bio}</p>`
                    : ""
                }
              </div>

              <!-- CTA  -->
              <div style="margin:24px 0 0;">
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://teamify.onlinemichel.dev"
                }/invite/${data.inviteCode}"
                   style="
                     display:block;
                     width:calc(100% - 48px);
                     text-align:center;
                     background-color:#6D5DE6;
                     color:#ffffff;
                     padding:14px 24px;
                     border-radius:9999px;
                     font-weight:600;
                     font-size:16px;
                     margin:0 auto;
                   ">
                  Rejoindre l'organisation
                </a>
              </div>
            </td>
          </tr>
  `;

  return baseEmailStructure(content);
};
