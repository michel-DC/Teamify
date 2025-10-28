import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  markNotificationAsRead,
  deleteNotification,
} from "@/lib/notification-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "ID de notification invalide" },
        { status: 400 }
      );
    }

    const result = await markNotificationAsRead(notificationId, user.uid);

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Notification non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notification marquée comme lue",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "ID de notification invalide" },
        { status: 400 }
      );
    }

    const result = await deleteNotification(notificationId, user.uid);

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Notification non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notification supprimée",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
