import { EventInvitationData } from "../types/email.types";
import { baseEmailStructure } from "./base-template.html";

export const generateEventInvitationEmail = (
  data: EventInvitationData,
  receiverName: string
): string => {
  const content = `
          <!-- Contenu carte -->
          <tr>
            <td class="content-padding" style="padding:32px; text-align:left; background:#ffffff;">
              <h1 style="margin:0 0 16px; color:#020102;">Bonjour ${receiverName},</h1>
              <p style="margin:0 0 24px;">
                Vous avez été invité à participer à un événement organisé sur <strong>Teamify</strong>.
              </p>

              <!-- Détails (même background que la carte, pas de sous-card grisée) -->
              <div style="margin:0 0 24px;">
                <p style="margin:0 0 8px;"><strong>Événement :</strong> ${
                  data.eventName
                }</p>
                <p style="margin:0 0 8px;"><strong>Catégorie :</strong> ${
                  data.eventCategory
                }</p>
                ${
                  data.eventDate
                    ? `<p style="margin:0 0 8px;"><strong>Date :</strong> ${data.eventDate}</p>`
                    : ""
                }
                ${
                  data.eventLocation
                    ? `<p style="margin:0 0 8px;"><strong>Lieu :</strong> ${data.eventLocation}</p>`
                    : ""
                }
                <p style="margin:0 0 8px;">
                  <strong>Participants :</strong> ${
                    data.participantsCount
                  } personne${data.participantsCount > 1 ? "s" : ""}
                </p>
                ${
                  data.description
                    ? `<p style="margin:0 0 8px;"><strong>Description :</strong> ${data.description}</p>`
                    : ""
                }
              </div>

              <!-- CTA  -->
              <div style="margin:24px 0 0;">
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://teamify.onlinemichel.dev"
                }/join-event?code=${data.invitationCode}"
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
                  Répondre à l'invitation
                </a>
              </div>
            </td>
          </tr>
  `;

  return baseEmailStructure(content);
};
