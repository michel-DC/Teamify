import { NextRequest, NextResponse } from "next/server";
import { getUnreadNotificationCount } from "@/lib/notification-service";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/notifications/count - Récupère le nombre de notifications non lues
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

    const unreadCount = await getUnreadNotificationCount(tokenPayload.userUid);

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Erreur lors du comptage des notifications:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
