"use server";

import { prisma } from "./prisma";
import { NotificationType } from "@prisma/client";
import { NotificationEmailService } from "../../emails/services/notification.service";

interface NotificationData {
  notificationName: string;
  notificationDescription: string;
  notificationType: NotificationType;
  eventPublicId?: string;
  organizationPublicId?: string;
  userUid: string;
}

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

    try {
      await sendNotificationEmail(notification);
    } catch (emailError) {
      console.error(
        "Erreur lors de l'envoi de l'email de notification:",
        emailError
      );
    }

    return notification;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw error;
  }
}

export async function createNotificationForOrganizationMembers(
  organizationId: number,
  notificationData: Omit<NotificationData, "userUid">
) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerUid: true, publicId: true },
    });

    if (!organization) {
      throw new Error("Organisation non trouvée");
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      select: { userUid: true },
    });

    const userIds = new Set<string>();
    members.forEach((member) => userIds.add(member.userUid));
    userIds.add(organization.ownerUid);

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

export async function createNotificationForOrganizationOwnersAndAdmins(
  organizationId: number,
  notificationData: Omit<NotificationData, "userUid">
) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerUid: true, publicId: true },
    });

    if (!organization) {
      throw new Error("Organisation non trouvée");
    }

    const admins = await prisma.organizationMember.findMany({
      where: {
        organizationId,
        role: { in: ["OWNER", "ADMIN"] },
      },
      select: { userUid: true },
    });

    const userIds = new Set<string>();
    admins.forEach((admin) => userIds.add(admin.userUid));
    userIds.add(organization.ownerUid);
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
      "Erreur lors de la création des notifications pour les OWNER/ADMIN:",
      error
    );
    throw error;
  }
}

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

async function sendNotificationEmail(notification: any) {
  try {
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
