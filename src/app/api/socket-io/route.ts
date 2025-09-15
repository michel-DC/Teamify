import { NextRequest, NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";
import { Socket as NetSocket } from "net";

/**
 * Configuration Socket.IO pour Vercel
 * Utilise les API routes Next.js pour gérer Socket.IO via les fonctions serverless
 */

// Interface pour étendre les types Next.js avec Socket.IO
interface SocketServer extends NetServer {
  io?: SocketIOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

// Stockage en mémoire pour les connexions (limité par les contraintes Vercel)
const connectedUsers = new Map<string, string>(); // userId -> socketId
const conversationRooms = new Map<string, Set<string>>(); // conversationId -> Set<socketId>

/**
 * Gestionnaire pour les requêtes Socket.IO
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transport = searchParams.get("transport");
    const sid = searchParams.get("sid");
    const t = searchParams.get("t"); // timestamp pour éviter le cache

    console.log("🔌 Requête Socket.IO GET:", { transport, sid, t });

    // Si c'est une requête de polling, simuler une réponse Socket.IO
    if (transport === "polling") {
      if (!sid) {
        // Première connexion - générer un SID et retourner la réponse d'initialisation
        const newSid = `socket_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Format de réponse Socket.IO pour l'initialisation
        const response = {
          sid: newSid,
          upgrades: [],
          pingInterval: 25000,
          pingTimeout: 60000,
          pingTimeoutParam: 60000,
        };

        console.log("🔌 Nouvelle connexion Socket.IO:", newSid);

        return new NextResponse(JSON.stringify(response), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      } else {
        // Requête de polling - simuler une réponse vide avec le bon format
        const response = {
          sid: sid,
          upgrades: [],
          pingInterval: 25000,
          pingTimeout: 60000,
        };

        console.log("🔌 Polling Socket.IO:", sid);

        return new NextResponse(JSON.stringify(response), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }
    }

    console.log("❌ Transport non supporté:", transport);
    return NextResponse.json(
      { error: "Transport non supporté" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Erreur dans l'API Socket.IO GET:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * Gestionnaire pour les requêtes POST Socket.IO (événements)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sid = searchParams.get("sid");
    const transport = searchParams.get("transport");

    if (!sid || transport !== "polling") {
      return NextResponse.json(
        { error: "Paramètres invalides" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    // Traitement des différents types d'événements Socket.IO
    switch (type) {
      case "message:send":
        await handleMessageSend(data, sid);
        break;
      case "message:read":
        await handleMessageRead(data, sid);
        break;
      case "join:conversation":
        await handleJoinConversation(data, sid);
        break;
      case "leave:conversation":
        await handleLeaveConversation(data, sid);
        break;
      default:
        console.log("📨 Événement Socket.IO non géré:", type, data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur dans l'API Socket.IO POST:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * Gestionnaire pour l'envoi de messages
 */
async function handleMessageSend(data: any, socketId: string) {
  try {
    console.log("📤 Message reçu via Socket.IO:", data);

    // Ici, vous pouvez ajouter la logique pour sauvegarder le message en base de données
    // et diffuser le message aux autres utilisateurs de la conversation

    // Pour l'instant, on simule juste la réception
    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: data.conversationId,
      senderId: "current_user", // À remplacer par l'ID réel de l'utilisateur
      content: data.content,
      attachments: data.attachments,
      createdAt: new Date(),
      sender: {
        uid: "current_user",
        firstname: "Utilisateur",
        lastname: "Test",
        profileImage: null,
      },
    };

    // Diffuser le message aux autres utilisateurs de la conversation
    await broadcastToConversation(
      data.conversationId,
      "message:new",
      messageData,
      socketId
    );
  } catch (error) {
    console.error("❌ Erreur lors du traitement du message:", error);
  }
}

/**
 * Gestionnaire pour marquer un message comme lu
 */
async function handleMessageRead(data: any, socketId: string) {
  try {
    console.log("👁️ Message marqué comme lu:", data);

    const readData = {
      messageId: data.messageId,
      userId: "current_user", // À remplacer par l'ID réel de l'utilisateur
      timestamp: new Date(),
    };

    // Diffuser l'événement de lecture aux autres utilisateurs
    await broadcastToConversation(
      "conversation_id",
      "message:read",
      readData,
      socketId
    );
  } catch (error) {
    console.error("❌ Erreur lors du marquage du message comme lu:", error);
  }
}

/**
 * Gestionnaire pour rejoindre une conversation
 */
async function handleJoinConversation(data: any, socketId: string) {
  try {
    console.log("👥 Rejoindre la conversation:", data);

    const { conversationId } = data;

    // Ajouter l'utilisateur à la room de conversation
    if (!conversationRooms.has(conversationId)) {
      conversationRooms.set(conversationId, new Set());
    }
    conversationRooms.get(conversationId)?.add(socketId);

    // Confirmer la jonction
    await broadcastToSocket(socketId, "conversation:joined", {
      conversationId,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la jonction à la conversation:", error);
  }
}

/**
 * Gestionnaire pour quitter une conversation
 */
async function handleLeaveConversation(data: any, socketId: string) {
  try {
    console.log("👋 Quitter la conversation:", data);

    const { conversationId } = data;

    // Retirer l'utilisateur de la room de conversation
    conversationRooms.get(conversationId)?.delete(socketId);

    // Confirmer la sortie
    await broadcastToSocket(socketId, "conversation:left", { conversationId });
  } catch (error) {
    console.error("❌ Erreur lors de la sortie de la conversation:", error);
  }
}

/**
 * Diffuse un événement à tous les utilisateurs d'une conversation
 */
async function broadcastToConversation(
  conversationId: string,
  event: string,
  data: any,
  excludeSocketId?: string
) {
  try {
    const room = conversationRooms.get(conversationId);
    if (!room) return;

    // Dans un vrai serveur Socket.IO, on utiliserait socket.to(room).emit()
    // Ici, on simule juste la diffusion
    console.log(
      `📡 Diffusion de l'événement '${event}' à la conversation ${conversationId}:`,
      data
    );

    // En production, vous devriez utiliser un service de messagerie en temps réel
    // comme Pusher, Ably, ou un serveur Socket.IO persistant
  } catch (error) {
    console.error("❌ Erreur lors de la diffusion:", error);
  }
}

/**
 * Diffuse un événement à un socket spécifique
 */
async function broadcastToSocket(socketId: string, event: string, data: any) {
  try {
    console.log(
      `📡 Diffusion de l'événement '${event}' au socket ${socketId}:`,
      data
    );

    // Dans un vrai serveur Socket.IO, on utiliserait socket.emit()
    // Ici, on simule juste la diffusion
  } catch (error) {
    console.error("❌ Erreur lors de la diffusion au socket:", error);
  }
}

/**
 * Gestionnaire pour les requêtes OPTIONS (CORS)
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

/**
 * Configuration pour Vercel
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
