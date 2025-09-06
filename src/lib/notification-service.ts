"use server";

import { prisma } from "./prisma";
import { NotificationType } from "@prisma/client";
import { NotificationEmailService } from "../../emails/services/notification.service";

/**
 * Interface pour les données de notification
 */
interface NotificationData {
  notificationName: string;
  notificationDescription: string;
  notificationType: NotificationType;
  eventPublicId?: string;
  organizationPublicId?: string;
  userUid: string;
}

/**
 * Crée une notification pour un utilisateur
 */
export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        notificationName: data.notificationName,
        notificationDescription: data.notificationDescription,
        notificationType: data.notificationType,
        eventPublicId: data.eventPublicId,
        organizationPublicId: data.organizationPublicId,
        userUid: data.userUid,
      },
    });

    // Envoyer un email de notification en arrière-plan
    try {
      await sendNotificationEmail(notification);
    } catch (emailError) {
      console.error(
        "Erreur lors de l'envoi de l'email de notification:",
        emailError
      );
      // Ne pas faire échouer la création de la notification si l'email échoue
    }

    return notification;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw error;
  }
}

/**
 * Crée des notifications pour tous les membres d'une organisation
 */
export async function createNotificationForOrganizationMembers(
  organizationId: number,
  notificationData: Omit<NotificationData, "userUid">
) {
  try {
    // Récupérer l'organisation avec son publicId
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerUid: true, publicId: true },
    });

    if (!organization) {
      throw new Error("Organisation non trouvée");
    }

    // Récupérer tous les membres de l'organisation
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      select: { userUid: true },
    });

    // Créer un ensemble unique d'utilisateurs
    const userIds = new Set<string>();
    members.forEach((member) => userIds.add(member.userUid));
    userIds.add(organization.ownerUid);

    // Créer les notifications pour chaque utilisateur
    const notifications = await Promise.all(
      Array.from(userIds).map((userUid) =>
        createNotification({
          ...notificationData,
          userUid,
          organizationPublicId: organization.publicId || undefined,
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
 * Récupère les notifications d'un utilisateur
 */
export async function getUserNotifications(userUid: string, limit = 50) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userUid },
      orderBy: { createdAt: "desc" },
      take: limit,
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

    return notifications;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    throw error;
  }
}

/**
 * Récupère le nombre de notifications non lues d'un utilisateur
 */
export async function getUnreadNotificationsCount(userUid: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userUid,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Erreur lors du comptage des notifications non lues:", error);
    return 0;
  }
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(
  notificationId: number,
  userUid: string
) {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userUid,
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
    console.error(
      "Erreur lors de la mise à jour de toutes les notifications:",
      error
    );
    throw error;
  }
}

/**
 * Supprime une notification
 */
export async function deleteNotification(
  notificationId: number,
  userUid: string
) {
  try {
    const notification = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userUid,
      },
    });

    return notification;
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    throw error;
  }
}

/**
 * Envoie un email de notification
 */
async function sendNotificationEmail(notification: any) {
  try {
    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { uid: notification.userUid },
      select: { email: true, firstname: true, lastname: true },
    });

    if (!user || !user.email) {
      console.warn(
        "Utilisateur non trouvé ou email manquant pour la notification:",
        notification.id
      );
      return;
    }

    // Récupérer les informations contextuelles
    let eventTitle: string | undefined;
    let organizationName: string | undefined;

    if (notification.eventPublicId) {
      const event = await prisma.event.findUnique({
        where: { publicId: notification.eventPublicId },
        select: { title: true },
      });
      eventTitle = event?.title;
    }

    if (notification.organizationPublicId) {
      const organization = await prisma.organization.findUnique({
        where: { publicId: notification.organizationPublicId },
        select: { name: true },
      });
      organizationName = organization?.name;
    }

    // Préparer les données pour l'email
    const emailData = {
      notificationName: notification.notificationName,
      notificationDescription: notification.notificationDescription,
      notificationType: notification.notificationType,
      eventTitle,
      eventPublicId: notification.eventPublicId,
      organizationName,
      organizationPublicId: notification.organizationPublicId,
      notificationDate: notification.createdAt.toISOString(),
    };

    // Envoyer l'email en arrière-plan
    const recipientName =
      `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Utilisateur";

    NotificationEmailService.sendNotificationEmailAsync(
      user.email,
      recipientName,
      emailData
    );
  } catch (error) {
    console.error(
      "Erreur lors de la préparation de l'email de notification:",
      error
    );
  }
}
