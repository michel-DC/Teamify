import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

/**
 * API route pour tester la configuration Pusher
 * GET /api/pusher-test
 */
export async function GET(req: NextRequest) {
  try {
    // Vérifier les variables d'environnement
    const envCheck = {
      PUSHER_APP_ID: !!process.env.PUSHER_APP_ID,
      PUSHER_KEY: !!process.env.PUSHER_KEY,
      PUSHER_SECRET: !!process.env.PUSHER_SECRET,
      PUSHER_CLUSTER: !!process.env.PUSHER_CLUSTER,
      NEXT_PUBLIC_PUSHER_KEY: !!process.env.NEXT_PUBLIC_PUSHER_KEY,
      NEXT_PUBLIC_PUSHER_CLUSTER: !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    };

    const missingVars = Object.entries(envCheck)
      .filter(([_, exists]) => !exists)
      .map(([key, _]) => key);

    // Tester la connexion Pusher
    let pusherTest = null;
    try {
      await pusherServer.trigger("test-channel", "test-event", {
        message: "Test de connexion Pusher",
        timestamp: new Date().toISOString(),
      });
      pusherTest = { success: true, message: "Connexion Pusher réussie" };
    } catch (error) {
      pusherTest = {
        success: false,
        message: "Erreur de connexion Pusher",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
        },
        variables: envCheck,
        missingVariables: missingVars,
        pusherTest,
        recommendations:
          missingVars.length > 0
            ? [
                "Vérifiez que toutes les variables d'environnement sont définies",
                "Redéployez l'application après avoir ajouté les variables manquantes",
              ]
            : [
                "Toutes les variables d'environnement sont présentes",
                "Vérifiez la configuration côté client",
              ],
      },
    });
  } catch (error) {
    console.error("❌ Erreur API pusher-test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du test Pusher",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pusher-test - Test d'envoi d'événement
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, event, data } = body;

    if (!channel || !event) {
      return NextResponse.json(
        { error: "Paramètres manquants: channel et event requis" },
        { status: 400 }
      );
    }

    // Envoyer l'événement de test
    await pusherServer.trigger(channel, event, {
      ...data,
      timestamp: new Date().toISOString(),
      test: true,
    });

    return NextResponse.json({
      success: true,
      message: `Événement ${event} envoyé sur le canal ${channel}`,
      data: {
        channel,
        event,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Erreur API pusher-test POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'envoi de l'événement",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
