import { NextRequest, NextResponse } from "next/server";
import { triggerPusherEvent } from "@/lib/pusher";

/**
 * API route pour déclencher des événements Pusher
 * POST /api/trigger-event
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, event, data } = body;

    // Validation des paramètres requis
    if (!channel || !event || !data) {
      return NextResponse.json(
        { error: "Paramètres manquants: channel, event, data requis" },
        { status: 400 }
      );
    }

    // Déclencher l'événement Pusher
    await triggerPusherEvent(channel, event, data);

    return NextResponse.json(
      {
        success: true,
        message: `Événement ${event} déclenché sur le canal ${channel}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur API trigger-event:", error);
    return NextResponse.json(
      { error: "Erreur lors du déclenchement de l'événement" },
      { status: 500 }
    );
  }
}

/**
 * Exemple d'utilisation:
 * POST /api/trigger-event
 * {
 *   "channel": "chat-channel",
 *   "event": "new-message",
 *   "data": {
 *     "id": "msg_123",
 *     "content": "Hello World!",
 *     "senderId": "user_456",
 *     "senderName": "John Doe",
 *     "timestamp": "2024-01-01T12:00:00Z"
 *   }
 * }
 */
