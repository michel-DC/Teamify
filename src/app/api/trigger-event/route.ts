import { NextRequest, NextResponse } from "next/server";
import { triggerPusherEvent } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, event, data } = body;

    if (!channel || !event || !data) {
      return NextResponse.json(
        { error: "Paramètres manquants: channel, event, data requis" },
        { status: 400 }
      );
    }

    await triggerPusherEvent(channel, event, data);

    return NextResponse.json(
      {
        success: true,
        message: `Événement ${event} déclenché sur le canal ${channel}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur API trigger-event:", error);
    return NextResponse.json(
      { error: "Erreur lors du déclenchement de l'événement" },
      { status: 500 }
    );
  }
}
