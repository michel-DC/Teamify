import { NextRequest } from "next/server";
import { getPendingMessages, addPendingMessage } from "@/lib/polling-server";
import { getCurrentUser } from "@/lib/auth";

/**
 * API route pour le polling long
 * GET: Récupérer les messages en attente
 * POST: Envoyer un message
 */

export async function GET(req: NextRequest) {
  try {
    // Authentification via cookies comme dans l'ancien système
    const user = await getCurrentUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.uid;
    const { searchParams } = new URL(req.url);
    const timeout = parseInt(searchParams.get("timeout") || "30000"); // 30s par défaut

    console.log(`📡 [API Polling] Polling for authenticated user: ${userId}`);

    // Attendre les messages avec timeout
    const startTime = Date.now();
    let messages = [];

    while (Date.now() - startTime < timeout) {
      messages = getPendingMessages(userId);
      if (messages.length > 0) {
        break;
      }
      // Attendre 100ms avant de vérifier à nouveau
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return new Response(JSON.stringify({ messages }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":
          "https://teamify.onlinemichel.dev, http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error) {
    console.error("❌ Error in polling GET:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentification via cookies comme dans l'ancien système
    const user = await getCurrentUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.uid;
    const body = await req.json();
    const { type, data } = body;

    console.log("📨 [API Polling] POST request received:", {
      type,
      data,
      userId,
      environment: process.env.NODE_ENV,
    });

    if (!type) {
      console.log("❌ [API Polling] Missing required fields:", { type });
      return new Response(JSON.stringify({ error: "type required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Créer un message de polling
    const pollingMessage = {
      id: `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      userId,
    };

    console.log("📨 [API Polling] Created polling message:", pollingMessage);

    // Ajouter le message en attente
    addPendingMessage(userId, pollingMessage);

    console.log("✅ [API Polling] Message added successfully");
    return new Response(
      JSON.stringify({ success: true, messageId: pollingMessage.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin":
            "https://teamify.onlinemichel.dev, http://localhost:3000",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("❌ [API Polling] Error in polling POST:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin":
        "https://teamify.onlinemichel.dev, http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
