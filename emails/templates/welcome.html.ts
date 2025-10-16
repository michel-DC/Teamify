import { baseEmailStructure } from "./base-template.html";
import { WelcomeEmailData } from "../types/email.types";

export function generateWelcomeEmail(
  data: WelcomeEmailData,
  recipientName: string
): string {
  const content = `
          <!-- Contenu carte -->
          <tr>
            <td class="content-padding" style="padding:32px; text-align:left; background:#ffffff;">
              <h1 style="margin:0 0 16px; color:#020102;">Bonjour ${recipientName},</h1>
              <p style="margin:0 0 24px;">
                Félicitations ! Votre compte a été créé avec succès sur <strong>Teamify</strong>.
              </p>

              <!-- Détails -->
              <div style="margin:0 0 24px;">
                ${
                  data.hasOrganization
                    ? generateExistingUserContent(data)
                    : generateNewUserContent()
                }
              </div>

              <!-- CTA -->
              <div style="margin:24px 0 0;">
                <a href="${getDashboardUrl()}/dashboard" 
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
                  Accéder à mon tableau de bord
                </a>
              </div>
            </td>
          </tr>
  `;

  return baseEmailStructure(content);
}

function generateExistingUserContent(data: WelcomeEmailData): string {
  return `
    <p style="margin:0 0 8px;"><strong>Organisation :</strong> ${data.organizationName}</p>
    <p style="margin:0 0 8px;"><strong>Statut :</strong> Membre actif</p>
  `;
}

function generateNewUserContent(): string {
  return `
    <p style="margin:0 0 16px;"><strong>Guide de démarrage :</strong></p>
    
    <div style="margin:0 0 12px; padding:16px; background-color:#f8f9fa; border-radius:8px;">
      <p style="margin:0 0 8px; font-weight:600;">1. Créez votre première organisation</p>
      <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">
        Commencez par créer une organisation pour regrouper vos événements et équipes.
      </p>
      <a href="${getDashboardUrl()}/create-organization" 
         style="color:#6D5DE6; text-decoration:none; font-size:14px; font-weight:600;">
        Créer une organisation →
      </a>
    </div>

    <div style="margin:0 0 12px; padding:16px; background-color:#f8f9fa; border-radius:8px;">
      <p style="margin:0 0 8px; font-weight:600;">2. Invitez vos collègues et amis</p>
      <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">
        Une fois votre organisation créée, invitez vos collaborateurs à vous rejoindre.
      </p>
      <a href="${getDashboardUrl()}/dashboard/organizations/invitations" 
         style="color:#6D5DE6; text-decoration:none; font-size:14px; font-weight:600;">
        Gérer les invitations →
      </a>
    </div>

    <div style="margin:0 0 12px; padding:16px; background-color:#f8f9fa; border-radius:8px;">
      <p style="margin:0 0 8px; font-weight:600;">3. Créez votre premier événement</p>
      <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">
        Organisez votre premier événement avec toutes les informations nécessaires.
      </p>
      <a href="${getDashboardUrl()}/dashboard/events/new" 
         style="color:#6D5DE6; text-decoration:none; font-size:14px; font-weight:600;">
        Créer un événement →
      </a>
    </div>

    <div style="margin:0 0 12px; padding:16px; background-color:#f8f9fa; border-radius:8px;">
      <p style="margin:0 0 8px; font-weight:600;">4. Envoyez des invitations par email</p>
      <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">
        Invitez vos convives directement par email avec un lien personnalisé.
      </p>
      <a href="${getDashboardUrl()}/dashboard/events/invitations" 
         style="color:#6D5DE6; text-decoration:none; font-size:14px; font-weight:600;">
        Gérer les invitations →
      </a>
    </div>

    <div style="margin:0 0 12px; padding:16px; background-color:#f8f9fa; border-radius:8px;">
      <p style="margin:0 0 8px; font-weight:600;">5. Préparez votre événement</p>
      <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">
        Utilisez notre système de tâches pour organiser tous les détails de votre événement.
      </p>
      <p style="margin:0; color:#9ca3af; font-size:13px; font-style:italic;">
        Disponible après la création de votre premier événement
      </p>
    </div>
  `;
}

function getDashboardUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://teamify.onlinemichel.dev";
}
