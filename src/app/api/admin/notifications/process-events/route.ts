import { NextRequest, NextResponse } from "next/server";
import { processEventNotifications } from "@/lib/event-notification-scheduler";
import { verifyToken } from "@/lib/auth";

/**
 * POST /api/admin/notifications/process-events - Traite les notifications d'événements
 * Endpoint pour déclencher manuellement le traitement des notifications d'événements
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // Pour l'instant, on autorise tous les utilisateurs authentifiés
    // Dans un vrai système, on pourrait vérifier si l'utilisateur est admin
    console.log(
      `[Admin API] Traitement des notifications d'événements demandé par ${user.uid}`
    );

    const result = await processEventNotifications();

    return NextResponse.json({
      message: "Notifications d'événements traitées avec succès",
      result,
    });
  } catch (error) {
    console.error(
      "Erreur lors du traitement des notifications d'événements:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
