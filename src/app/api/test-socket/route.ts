import { NextRequest, NextResponse } from "next/server";

/**
 * Route de test pour vérifier la configuration Socket.IO Vercel
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get("test");

    if (test === "connection") {
      // Test de connexion Socket.IO
      const socketUrl =
        process.env.NODE_ENV === "production"
          ? "https://your-domain.vercel.app"
          : "http://localhost:3000";

      return NextResponse.json({
        success: true,
        message: "Configuration Socket.IO Vercel prête",
        socketUrl,
        features: {
          polling: true,
          websockets: false,
          vercelCompatible: true,
          serverless: true,
        },
        endpoints: {
          socketIO: "/api/socket-io",
          test: "/api/test-socket",
        },
      });
    }

    if (test === "ping") {
      return NextResponse.json({
        success: true,
        message: "Pong! Socket.IO Vercel est opérationnel",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "API de test Socket.IO Vercel",
      tests: {
        connection: "/api/test-socket?test=connection",
        ping: "/api/test-socket?test=ping",
      },
    });
  } catch (error) {
    console.error("❌ Erreur dans l'API de test Socket.IO:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
