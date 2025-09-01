import { Resend } from "resend";
import {
  OrganizationInvitationData,
  EmailServiceResponse,
} from "../types/email.types";
import { generateOrganizationInvitationEmail } from "../templates/organization-invitation.html";

const resend = new Resend(process.env.RESEND_API_KEY);

export class OrganizationInvitationService {
  /**
   * Envoie une invitation par email pour rejoindre une organisation
   */
  static async sendInvitation(
    email: string,
    receiverName: string,
    data: OrganizationInvitationData
  ): Promise<EmailServiceResponse> {
    try {
      // Génération du HTML de l'email
      const htmlContent = generateOrganizationInvitationEmail(
        data,
        receiverName
      );

      // Envoi via Resend
      const { data: resendData, error } = await resend.emails.send({
        from: "Teamify <contact@onlinemichel.dev>",
        to: [email],
        subject: `Invitation à rejoindre ${data.organizationName}`,
        html: htmlContent,
      });

      if (error) {
        console.error("Erreur Resend:", error);
        return {
          success: false,
          error: "Erreur lors de l'envoi de l'email",
        };
      }

      return {
        success: true,
        data: resendData,
      };
    } catch (error) {
      console.error("Erreur service invitation organisation:", error);
      return {
        success: false,
        error: "Erreur interne du service",
      };
    }
  }
}
