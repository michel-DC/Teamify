import { PrismaClient, EventStatus } from "@prisma/client";
import {
  createNotification,
  createNotificationForEventParticipants,
} from "./notification-service";

const prisma = new PrismaClient();

/**
 * Vérifie et crée des notifications pour les événements qui commencent maintenant
 */
export async function checkEventStartNotifications() {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes dans le futur

    // Trouver les événements qui commencent dans les 5 prochaines minutes
    const eventsStarting = await prisma.event.findMany({
      where: {
        startDate: {
          gte: now,
          lte: fiveMinutesFromNow,
        },
        status: EventStatus.A_VENIR,
        isCancelled: false,
      },
      include: {
        organization: {
          select: {
            publicId: true,
            name: true,
          },
        },
      },
    });

    console.log(
      `[Event Notifications] ${eventsStarting.length} événements commencent bientôt`
    );

    for (const event of eventsStarting) {
      // Créer une notification pour le propriétaire de l'événement
      try {
        await createNotification({
          notificationName: "Événement qui commence",
          notificationDescription: `Votre événement "${event.title}" commence maintenant !`,
          notificationType: "REMINDER",
          userUid: event.ownerUid,
          eventPublicId: event.publicId,
          organizationPublicId: event.organization.publicId,
        });
      } catch (error) {
        console.error(
          `Erreur notification propriétaire pour l'événement ${event.id}:`,
          error
        );
      }

      // Créer une notification pour tous les participants
      try {
        await createNotificationForEventParticipants(event.eventCode, {
          notificationName: "Événement qui commence",
          notificationDescription: `L'événement "${event.title}" commence maintenant !`,
          notificationType: "REMINDER",
          eventPublicId: event.publicId,
          organizationPublicId: event.organization.publicId,
        });
      } catch (error) {
        console.error(
          `Erreur notification participants pour l'événement ${event.id}:`,
          error
        );
      }

      // Mettre à jour le statut de l'événement
      try {
        await prisma.event.update({
          where: { id: event.id },
          data: { status: EventStatus.EN_COURS },
        });
      } catch (error) {
        console.error(
          `Erreur mise à jour statut pour l'événement ${event.id}:`,
          error
        );
      }
    }

    return eventsStarting.length;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification des événements qui commencent:",
      error
    );
    throw error;
  }
}

/**
 * Vérifie et crée des notifications pour les événements qui se terminent maintenant
 */
export async function checkEventEndNotifications() {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes dans le futur

    // Trouver les événements qui se terminent dans les 5 prochaines minutes
    const eventsEnding = await prisma.event.findMany({
      where: {
        endDate: {
          gte: now,
          lte: fiveMinutesFromNow,
        },
        status: EventStatus.EN_COURS,
        isCancelled: false,
      },
      include: {
        organization: {
          select: {
            publicId: true,
            name: true,
          },
        },
      },
    });

    console.log(
      `[Event Notifications] ${eventsEnding.length} événements se terminent bientôt`
    );

    for (const event of eventsEnding) {
      // Créer une notification pour le propriétaire de l'événement
      try {
        await createNotification({
          notificationName: "Événement terminé",
          notificationDescription: `Votre événement "${event.title}" vient de se terminer.`,
          notificationType: "INFO",
          userUid: event.ownerUid,
          eventPublicId: event.publicId,
          organizationPublicId: event.organization.publicId,
        });
      } catch (error) {
        console.error(
          `Erreur notification propriétaire pour l'événement ${event.id}:`,
          error
        );
      }

      // Créer une notification pour tous les participants
      try {
        await createNotificationForEventParticipants(event.eventCode, {
          notificationName: "Événement terminé",
          notificationDescription: `L'événement "${event.title}" vient de se terminer.`,
          notificationType: "INFO",
          eventPublicId: event.publicId,
          organizationPublicId: event.organization.publicId,
        });
      } catch (error) {
        console.error(
          `Erreur notification participants pour l'événement ${event.id}:`,
          error
        );
      }

      // Mettre à jour le statut de l'événement
      try {
        await prisma.event.update({
          where: { id: event.id },
          data: { status: EventStatus.TERMINE },
        });
      } catch (error) {
        console.error(
          `Erreur mise à jour statut pour l'événement ${event.id}:`,
          error
        );
      }
    }

    return eventsEnding.length;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification des événements qui se terminent:",
      error
    );
    throw error;
  }
}

/**
 * Fonction principale qui vérifie tous les types de notifications d'événements
 */
export async function processEventNotifications() {
  try {
    console.log(
      "[Event Notifications] Début du traitement des notifications d'événements"
    );

    const startingCount = await checkEventStartNotifications();
    const endingCount = await checkEventEndNotifications();

    console.log(
      `[Event Notifications] Traitement terminé: ${startingCount} événements commencent, ${endingCount} événements se terminent`
    );

    return {
      eventsStarting: startingCount,
      eventsEnding: endingCount,
    };
  } catch (error) {
    console.error(
      "Erreur lors du traitement des notifications d'événements:",
      error
    );
    throw error;
  }
}
