import { EventInvitationData } from "../types/email.types";
import { baseEmailStructure } from "./base-template.html";

export const generateEventInvitationEmail = (
  data: EventInvitationData,
  receiverName: string
): string => {
  const content = `
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
                    
                    <p style="margin:0 0 6px; font-size:15px;"><strong>Événement :</strong> ${
                      data.eventName
                    }</p>
                    <p style="margin:0 0 6px; font-size:15px;"><strong>Catégorie :</strong> ${
                      data.eventCategory
                    }</p>
                    ${
                      data.eventDate
                        ? `<p style="margin:0 0 6px; font-size:15px;"><strong>Date :</strong> ${data.eventDate}</p>`
                        : ""
                    }
                    ${
                      data.eventLocation
                        ? `<p style="margin:0 0 6px; font-size:15px;"><strong>Lieu :</strong> ${data.eventLocation}</p>`
                        : ""
                    }
                    <p style="margin:0 0 6px; font-size:15px;">
                      <strong>Participants :</strong> ${
                        data.participantsCount
                      } personne${data.participantsCount > 1 ? "s" : ""}
                    </p>
                    ${
                      data.description
                        ? `<p style="margin:12px 0 0; font-size:15px; color:#4b5563;"><strong>Description :</strong> ${data.description}</p>`
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
              }/join-event?code=${data.invitationCode}"
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
  `;

  return baseEmailStructure(content);
};
