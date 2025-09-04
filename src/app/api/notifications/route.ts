import { NextRequest, NextResponse } from "next/server";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notification-service";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/notifications - Récupère les notifications de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const tokenPayload = await verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const includeUnreadCount =
      searchParams.get("includeUnreadCount") === "true";

    // Récupérer les notifications
    const notifications = await getUserNotifications(
      tokenPayload.userUid,
      limit
    );

    let response: any = { notifications };

    // Inclure le nombre de notifications non lues si demandé
    if (includeUnreadCount) {
      const unreadCount = await getUnreadNotificationCount(
        tokenPayload.userUid
      );
      response.unreadCount = unreadCount;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
