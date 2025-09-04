import { NextRequest, NextResponse } from "next/server";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/notification-service";
import { verifyToken } from "@/lib/auth";

/**
 * PUT /api/notifications/[id] - Marque une notification comme lue
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const tokenPayload = await verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { id } = params;

    if (id === "all") {
      // Marquer toutes les notifications comme lues
      const result = await markAllNotificationsAsRead(tokenPayload.userUid);
      return NextResponse.json({
        message: "Toutes les notifications ont été marquées comme lues",
        count: result.count,
      });
    } else {
      // Marquer une notification spécifique comme lue
      const notification = await markNotificationAsRead(id);
      return NextResponse.json({
        message: "Notification marquée comme lue",
        notification,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id] - Supprime une notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const tokenPayload = await verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { id } = params;
    const notification = await deleteNotification(id);

    return NextResponse.json({
      message: "Notification supprimée",
      notification,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
