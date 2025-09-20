/**
 * Serveur de polling long pour simuler Socket.IO sur Vercel
 * Utilise des API routes Next.js pour gérer les messages en temps réel
 */

import { prisma } from "@/lib/prisma";

/**
 * Types pour les événements de polling
 */
export interface PollingMessage {
  id: string;
  type:
    | "message:new"
    | "message:read"
    | "conversation:joined"
    | "error"
    | "pong"
    | "welcome";
  data: any;
  timestamp: string;
  userId: string;
  conversationId?: string;
}

/**
 * Store en mémoire pour les messages en attente (en production, utiliser Redis)
 */
const pendingMessages = new Map<string, PollingMessage[]>();

/**
 * Ajouter un message en attente pour un utilisateur
 */
export function addPendingMessage(userId: string, message: PollingMessage) {
  if (!pendingMessages.has(userId)) {
    pendingMessages.set(userId, []);
  }
  pendingMessages.get(userId)!.push(message);
  console.log(`📨 [PollingServer] Message added for user ${userId}:`, {
    type: message.type,
    id: message.id,
    conversationId: message.conversationId,
    data: message.data,
  });
}

/**
 * Récupérer les messages en attente pour un utilisateur
 */
export function getPendingMessages(userId: string): PollingMessage[] {
  const messages = pendingMessages.get(userId) || [];
  pendingMessages.set(userId, []); // Vider après récupération
  console.log(`📥 [PollingServer] Messages retrieved for user ${userId}:`, {
    count: messages.length,
    messages: messages.map((m) => ({
      type: m.type,
      id: m.id,
      conversationId: m.conversationId,
    })),
  });
  return messages;
}

/**
 * Diffuser un message à tous les membres d'une conversation
 */
export async function broadcastToConversation(
  conversationId: string,
  message: PollingMessage
) {
  try {
    // En développement, simuler la diffusion
    if (process.env.NODE_ENV === "development") {
      // En développement, diffuser à tous les utilisateurs de test
      const testUsers = ["test-user", "user1", "user2", "user3"];
      for (const userId of testUsers) {
        addPendingMessage(userId, message);
      }
      console.log(
        `📡 [PollingServer] Message broadcasted to ${testUsers.length} test users for conversation ${conversationId}`
      );
      return;
    }

    // En production, utiliser Prisma
    // Récupérer tous les membres de la conversation
    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    // Ajouter le message à tous les membres
    for (const member of members) {
      addPendingMessage(member.userId, message);
    }

    console.log(
      `📡 Message broadcasted to ${members.length} members of conversation ${conversationId}`
    );
  } catch (error) {
    console.error("❌ Error broadcasting to conversation:", error);
  }
}

/**
 * Diffuser un message à un utilisateur spécifique
 */
export function broadcastToUser(userId: string, message: PollingMessage) {
  addPendingMessage(userId, message);
  console.log(`📡 Message sent to user ${userId}`);
}

/**
 * Envoyer un message dans une conversation
 */
export async function sendMessage(data: {
  conversationId: string;
  content: string;
  attachments?: any;
  senderId: string;
}) {
  console.log("🚀 [PollingServer] sendMessage called with:", data);

  try {
    const { conversationId, content, attachments, senderId } = data;

    // En développement, simuler l'envoi sans base de données
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔧 [PollingServer] Development mode - simulating message creation for user:",
        senderId
      );

      const message = {
        id: `dev_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        senderId,
        content,
        attachments: attachments || null,
        createdAt: new Date(),
        sender: {
          uid: senderId,
          firstname: "Dev",
          lastname: "User",
          profileImage: null,
        },
      };

      console.log("📝 [PollingServer] Created message:", message);

      // Diffuser le message
      const pollingMessage: PollingMessage = {
        id: `msg_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`,
        type: "message:new",
        data: {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          attachments: message.attachments,
          createdAt: message.createdAt,
          sender: message.sender,
        },
        timestamp: new Date().toISOString(),
        userId: senderId,
        conversationId,
      };

      console.log(
        "📡 [PollingServer] Created polling message:",
        pollingMessage
      );

      console.log(
        "📨 [PollingServer] Adding message to sender's queue:",
        senderId
      );
      addPendingMessage(senderId, pollingMessage); // Add to sender's queue

      console.log(
        "📢 [PollingServer] Broadcasting to conversation:",
        conversationId
      );
      await broadcastToConversation(conversationId, pollingMessage);

      console.log("✅ [PollingServer] Message sent successfully");
      return message;
    }

    // En production, utiliser Prisma
    // Vérifier que l'utilisateur est membre de la conversation
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: senderId,
        },
      },
    });

    if (!membership) {
      throw new Error("Vous n'êtes pas membre de cette conversation");
    }

    // Créer le message en base
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        attachments: attachments || null,
      },
      include: {
        sender: {
          select: {
            uid: true,
            firstname: true,
            lastname: true,
            profileImage: true,
          },
        },
      },
    });

    // Créer les reçus de message pour chaque membre
    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    await Promise.all(
      members.map((member) =>
        prisma.messageReceipt.create({
          data: {
            messageId: message.id,
            userId: member.userId,
            status: member.userId === senderId ? "READ" : "DELIVERED",
          },
        })
      )
    );

    // Diffuser le message
    const pollingMessage: PollingMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "message:new",
      data: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        attachments: message.attachments,
        createdAt: message.createdAt,
        sender: message.sender,
      },
      timestamp: new Date().toISOString(),
      userId: senderId,
      conversationId,
    };

    await broadcastToConversation(conversationId, pollingMessage);

    return message;
  } catch (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }
}

/**
 * Marquer un message comme lu
 */
export async function markMessageAsRead(messageId: string, userId: string) {
  try {
    // Vérifier que l'utilisateur a accès à ce message
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          members: {
            some: { userId },
          },
        },
      },
      include: {
        sender: true,
      },
    });

    if (!message) {
      throw new Error("Message non trouvé ou accès refusé");
    }

    // Mettre à jour le statut de lecture
    await prisma.messageReceipt.updateMany({
      where: {
        messageId,
        userId,
      },
      data: {
        status: "READ",
        timestamp: new Date(),
      },
    });

    // Notifier l'expéditeur si ce n'est pas lui
    if (message.senderId !== userId) {
      const pollingMessage: PollingMessage = {
        id: `read_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "message:read",
        data: {
          messageId,
          userId,
          timestamp: new Date(),
        },
        timestamp: new Date().toISOString(),
        userId: message.senderId,
      };

      broadcastToUser(message.senderId, pollingMessage);
    }
  } catch (error) {
    console.error("❌ Error marking message as read:", error);
    throw error;
  }
}
