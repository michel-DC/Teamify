import { Resend } from "resend";
import { WelcomeEmailData, EmailServiceResponse } from "../types/email.types";
import { generateWelcomeEmail } from "../templates/welcome.html";

const resend = new Resend(process.env.RESEND_API_KEY);

export class WelcomeEmailService {
  /**
   * Envoie un email de bienvenue
   */
  static async sendWelcomeEmail(
    email: string,
    recipientName: string,
    data: WelcomeEmailData
  ): Promise<EmailServiceResponse> {
    try {
      // Génération du HTML de l'email
      const htmlContent = generateWelcomeEmail(data, recipientName);

      // Envoi via Resend
      const { data: resendData, error } = await resend.emails.send({
        from: "Teamify - Bienvenue <welcome@onlinemichel.dev>",
        to: [email],
        subject: `🎉 Bienvenue sur Teamify, ${recipientName} !`,
        html: htmlContent,
        headers: {
          "X-Priority": "2", // Priorité normale
        },
      });

      if (error) {
        console.error(
          "Erreur Resend lors de l'envoi de l'email de bienvenue:",
          error
        );
        return {
          success: false,
          error: `Erreur lors de l'envoi de l'email: ${error.message}`,
        };
      }

      console.log("Email de bienvenue envoyé avec succès:", resendData);
      return {
        success: true,
        data: resendData,
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  /**
   * Envoie un email de bienvenue en arrière-plan (non bloquant)
   */
  static async sendWelcomeEmailAsync(
    email: string,
    recipientName: string,
    data: WelcomeEmailData
  ): Promise<void> {
    // Exécution en arrière-plan sans attendre le résultat
    setImmediate(async () => {
      try {
        const result = await this.sendWelcomeEmail(email, recipientName, data);
        if (!result.success) {
          console.error(
            "Échec de l'envoi de l'email de bienvenue:",
            result.error
          );
        }
      } catch (error) {
        console.error("Erreur dans l'envoi asynchrone de bienvenue:", error);
      }
    });
  }
}
