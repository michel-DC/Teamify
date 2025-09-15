import { NextRequest, NextResponse } from "next/server";

/**
 * API Socket.IO simplifiée pour Vercel
 * Version simplifiée qui évite les problèmes de protocole Socket.IO complexe
 */

// Stockage en mémoire pour les messages (limité par les contraintes Vercel)
const messages = new Map<string, any[]>();
const connections = new Set<string>();

/**
 * Gestionnaire GET - Simulation de connexion Socket.IO
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const conversationId = searchParams.get("conversationId");
    const userId = searchParams.get("userId");

    console.log("🔌 Socket.IO Simple GET:", { action, conversationId, userId });

    if (action === "connect") {
      // Simuler une connexion
      const connectionId = `conn_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      connections.add(connectionId);

      return NextResponse.json({
        success: true,
        connectionId,
        message: "Connexion établie",
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "poll" && conversationId) {
      // Récupérer les messages pour une conversation
      const conversationMessages = messages.get(conversationId) || [];

      return NextResponse.json({
        success: true,
        messages: conversationMessages,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Action non supportée",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Erreur Socket.IO Simple GET:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne" },
      { status: 500 }
    );
  }
}

/**
 * Gestionnaire POST - Envoi de messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, conversationId, message, userId } = body;

    console.log("📤 Socket.IO Simple POST:", {
      action,
      conversationId,
      userId,
    });

    if (action === "send" && conversationId && message) {
      // Ajouter le message à la conversation
      if (!messages.has(conversationId)) {
        messages.set(conversationId, []);
      }

      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        content: message.content,
        senderId: userId || "anonymous",
        sender: {
          uid: userId || "anonymous",
          firstname: "Utilisateur",
          lastname: "Test",
          profileImage: null,
        },
        createdAt: new Date().toISOString(),
        attachments: message.attachments,
      };

      messages.get(conversationId)!.push(newMessage);

      return NextResponse.json({
        success: true,
        message: "Message envoyé",
        messageId: newMessage.id,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "join" && conversationId) {
      // Rejoindre une conversation
      return NextResponse.json({
        success: true,
        message: "Conversation rejointe",
        conversationId,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "leave" && conversationId) {
      // Quitter une conversation
      return NextResponse.json({
        success: true,
        message: "Conversation quittée",
        conversationId,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Action non supportée",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Erreur Socket.IO Simple POST:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne" },
      { status: 500 }
    );
  }
}

/**
 * Gestionnaire OPTIONS pour CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
