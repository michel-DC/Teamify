import { Resend } from "resend";
import {
  NotificationEmailData,
  EmailServiceResponse,
} from "../types/email.types";
import { generateNotificationEmail } from "../templates/notification.html";

const resend = new Resend(process.env.RESEND_API_KEY);

export class NotificationEmailService {
  static async sendNotificationEmail(
    email: string,
    recipientName: string,
    data: NotificationEmailData
  ): Promise<EmailServiceResponse> {
    try {
      const htmlContent = generateNotificationEmail(data, recipientName);

      const { data: resendData, error } = await resend.emails.send({
        from: "L'équipe Teamify <contact@onlinemichel.dev>",
        to: [email],
        subject: `${data.notificationName}`,
        html: htmlContent,
        headers: {
          "X-Priority": getPriorityHeader(data.notificationType),
        },
      });

      if (error) {
        console.error("Erreur Resend lors de l'envoi de notification:", error);
        return {
          success: false,
          error: `Erreur lors de l'envoi de l'email: ${error.message}`,
        };
      }

      console.log("Email de notification envoyé avec succès:", resendData);
      return {
        success: true,
        data: resendData,
      };
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de l'email de notification:",
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  static async sendNotificationEmailAsync(
    email: string,
    recipientName: string,
    data: NotificationEmailData
  ): Promise<void> {
    setImmediate(async () => {
      try {
        const result = await this.sendNotificationEmail(
          email,
          recipientName,
          data
        );
        if (!result.success) {
          console.error(
            "Échec de l'envoi de l'email de notification:",
            result.error
          );
        }
      } catch (error) {
        console.error("Erreur dans l'envoi asynchrone de notification:", error);
      }
    });
  }

  static async sendBulkNotificationEmails(
    recipients: Array<{ email: string; name: string }>,
    data: NotificationEmailData
  ): Promise<EmailServiceResponse[]> {
    const results: EmailServiceResponse[] = [];

    const batchSize = 5;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchPromises = batch.map(async (recipient) => {
        try {
          return await this.sendNotificationEmail(
            recipient.email,
            recipient.name,
            data
          );
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}

function getPriorityHeader(
  type: NotificationEmailData["notificationType"]
): string {
  switch (type) {
    case "ERROR":
    case "WARNING":
      return "1";
    case "INVITATION":
    case "REMINDER":
      return "2";
    case "SUCCESS":
    case "UPDATE":
    case "INFO":
    default:
      return "3";
  }
}
