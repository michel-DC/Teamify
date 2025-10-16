import { baseEmailStructure } from "./base-template.html";
import { NotificationEmailData } from "../types/email.types";

export function generateNotificationEmail(
  data: NotificationEmailData,
  recipientName: string
): string {
  const content = `
          <!-- Contenu carte -->
          <tr>
            <td class="content-padding" style="padding:32px; text-align:left; background:#ffffff;">
              <h1 style="margin:0 0 16px; color:#020102;">Bonjour ${recipientName},</h1>
              <p style="margin:0 0 24px;">
                Vous avez reçu une nouvelle notification sur <strong>Teamify</strong>.
              </p>

              <!-- Détails de la notification -->
              <div style="margin:0 0 24px;">
                <p style="margin:0 0 8px;"><strong>Notification :</strong> ${
                  data.notificationName
                }</p>
                <p style="margin:0 0 8px;"><strong>Description :</strong> ${
                  data.notificationDescription
                }</p>
                <p style="margin:0 0 8px;"><strong>Type :</strong> ${getNotificationTypeLabel(
                  data.notificationType
                )}</p>
                <p style="margin:0 0 8px;"><strong>Date :</strong> ${formatDate(
                  data.notificationDate
                )}</p>
              </div>

              <!-- Informations contextuelles -->
              ${generateContextualInfo(data)}
              
              <!-- CTA -->
              <div style="margin:24px 0 0;">
                <a href="${getDashboardUrl()}/dashboard/notifications" 
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
                  Voir toutes mes notifications
                </a>
              </div>
            </td>
          </tr>
  `;

  return baseEmailStructure(content);
}

function generateContextualInfo(data: NotificationEmailData): string {
  let contextualInfo = "";

  if (data.eventTitle && data.eventPublicId) {
    contextualInfo += `
      <p style="margin:0 0 8px;"><strong>Événement concerné :</strong> ${data.eventTitle}</p>
    `;
  }

  if (data.organizationName && data.organizationPublicId) {
    contextualInfo += `
      <p style="margin:0 0 8px;"><strong>Organisation concernée :</strong> ${data.organizationName}</p>
    `;
  }

  return contextualInfo;
}

function getNotificationTypeLabel(
  type: NotificationEmailData["notificationType"]
): string {
  switch (type) {
    case "SUCCESS":
      return "Succès";
    case "WARNING":
      return "Avertissement";
    case "ERROR":
      return "Erreur";
    case "INVITATION":
      return "Invitation";
    case "REMINDER":
      return "Rappel";
    case "UPDATE":
      return "Mise à jour";
    default:
      return "Information";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDashboardUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://teamify.onlinemichel.dev";
}
