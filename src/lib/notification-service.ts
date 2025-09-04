import { PrismaClient, NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateNotificationData {
  notificationName: string;
  notificationDescription: string;
  notificationType: NotificationType;
  userUid: string;
  eventPublicId?: string;
  organizationPublicId?: string;
  notificationDate?: Date;
}

/**
 * Crée une nouvelle notification pour un utilisateur
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        notificationName: data.notificationName,
        notificationDescription: data.notificationDescription,
        notificationType: data.notificationType,
        userUid: data.userUid,
        eventPublicId: data.eventPublicId,
        organizationPublicId: data.organizationPublicId,
        notificationDate: data.notificationDate || new Date(),
      },
      include: {
        event: {
          select: {
            title: true,
            publicId: true,
          },
        },
        organization: {
          select: {
            name: true,
            publicId: true,
          },
        },
      },
    });

    return notification;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw error;
  }
}

/**
 * Récupère toutes les notifications d'un utilisateur
 */
export async function getUserNotifications(userUid: string, limit = 50) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userUid,
      },
      include: {
        event: {
          select: {
            title: true,
            publicId: true,
          },
        },
        organization: {
          select: {
            name: true,
            publicId: true,
          },
        },
      },
      orderBy: {
        notificationDate: "desc",
      },
      take: limit,
    });

    return notifications;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    throw error;
  }
}

/**
 * Récupère le nombre de notifications non lues d'un utilisateur
 */
export async function getUnreadNotificationCount(userUid: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userUid,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Erreur lors du comptage des notifications:", error);
    throw error;
  }
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: {
        publicId: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    return notification;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    throw error;
  }
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 */
export async function markAllNotificationsAsRead(userUid: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userUid,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return result;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notifications:", error);
    throw error;
  }
}

/**
 * Supprime une notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const notification = await prisma.notification.delete({
      where: {
        publicId: notificationId,
      },
    });

    return notification;
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    throw error;
  }
}

/**
 * Crée une notification pour tous les membres d'une organisation
 */
export async function createNotificationForOrganizationMembers(
  organizationId: number,
  notificationData: Omit<CreateNotificationData, "userUid">
) {
  try {
    // Récupérer tous les membres de l'organisation
    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId,
      },
      select: {
        userUid: true,
      },
    });

    // Créer une notification pour chaque membre
    const notifications = await Promise.all(
      members.map((member) =>
        createNotification({
          ...notificationData,
          userUid: member.userUid,
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error(
      "Erreur lors de la création des notifications pour l'organisation:",
      error
    );
    throw error;
  }
}

/**
 * Crée une notification pour tous les participants d'un événement
 */
export async function createNotificationForEventParticipants(
  eventCode: string,
  notificationData: Omit<CreateNotificationData, "userUid">
) {
  try {
    // Récupérer tous les participants de l'événement
    const participants = await prisma.invitation.findMany({
      where: {
        eventCode,
        status: "ACCEPTED",
      },
      select: {
        receiverEmail: true,
      },
    });

    // Récupérer les utilisateurs correspondants
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: participants.map((p) => p.receiverEmail),
        },
      },
      select: {
        uid: true,
      },
    });

    // Créer une notification pour chaque participant
    const notifications = await Promise.all(
      users.map((user) =>
        createNotification({
          ...notificationData,
          userUid: user.uid,
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error(
      "Erreur lors de la création des notifications pour l'événement:",
      error
    );
    throw error;
  }
}
