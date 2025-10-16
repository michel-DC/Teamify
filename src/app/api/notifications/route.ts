import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
} from "@/lib/notification-service";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = await getUserNotifications(user.uid, limit);

    const filteredNotifications = unreadOnly
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;

    const unreadCount = await getUnreadNotificationsCount(user.uid);

    return NextResponse.json({
      notifications: filteredNotifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * Marque toutes les notifications comme lues
 */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const result = await markAllNotificationsAsRead(user.uid);

    return NextResponse.json({
      message: "Toutes les notifications ont été marquées comme lues",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notifications:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
