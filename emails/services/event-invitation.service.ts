import { Resend } from "resend";
import {
  EventInvitationData,
  EmailServiceResponse,
} from "../types/email.types";
import { generateEventInvitationEmail } from "../templates/event-invitation.html";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EventInvitationService {
  static async sendInvitation(
    email: string,
    receiverName: string,
    data: EventInvitationData
  ): Promise<EmailServiceResponse> {
    try {
      const htmlContent = generateEventInvitationEmail(data, receiverName);

      const { data: resendData, error } = await resend.emails.send({
        from: "Teamify - Gestion d'événements <contact@onlinemichel.dev>",
        to: [email],
        subject: `Invitation à l'événement : ${data.eventName}`,
        html: htmlContent,
        headers: {
          "X-Profile-Image":
            "https://teamify.onlinemichel.dev/images/logo/favicon-v2.png",
        },
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
      console.error("Erreur service invitation événement:", error);
      return {
        success: false,
        error: "Erreur interne du service",
      };
    }
  }
}
