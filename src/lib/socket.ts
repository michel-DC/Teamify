import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";
import { Socket } from "socket.io";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Déclaration globale pour éviter les multi-instances
declare global {
  var io: SocketIOServer | undefined;
}

/**
 * Types pour les événements Socket.IO
 */
interface ServerToClientEvents {
  "message:new": (data: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    attachments?: any;
    createdAt: Date;
    sender: {
      uid: string;
      firstname: string | null;
      lastname: string | null;
      profileImage: string | null;
    };
  }) => void;
  "message:read": (data: {
    messageId: string;
    userId: string;
    timestamp: Date;
  }) => void;
  "conversation:joined": (data: { conversationId: string }) => void;
  error: (data: { message: string; code?: string }) => void;
}

interface ClientToServerEvents {
  "message:send": (data: {
    conversationId: string;
    content: string;
    attachments?: any;
  }) => void;
  "message:read": (data: { messageId: string }) => void;
  "join:conversation": (data: { conversationId: string }) => void;
  "leave:conversation": (data: { conversationId: string }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
  userUid: string;
}

/**
 * Initialise le serveur Socket.IO
 */
export function initializeSocketIO(httpServer?: NetServer) {
  if (globalThis.io) {
    return globalThis.io;
  }

  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_APP_URL
          : "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  /**
   * Middleware d'authentification pour Socket.IO
   */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Token d'authentification requis"));
      }

      // Vérifier le token JWT
      const decoded = await verifyToken(token);
      if (!decoded) {
        return next(new Error("Token invalide"));
      }

      // Vérifier que l'utilisateur existe en base
      const user = await prisma.user.findUnique({
        where: { uid: decoded.userUid },
        select: {
          uid: true,
          firstname: true,
          lastname: true,
          profileImage: true,
        },
      });

      if (!user) {
        return next(new Error("Utilisateur non trouvé"));
      }

      // Stocker les données utilisateur dans le socket
      socket.data.userId = user.uid;
      socket.data.userUid = user.uid;

      next();
    } catch (error) {
      console.error("[Socket.IO] Erreur d'authentification:", error);
      next(new Error("Erreur d'authentification"));
    }
  });

  /**
   * Gestion de la connexion d'un client
   */
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;

    try {
      // Rejoindre la room utilisateur
      await socket.join(`user:${userId}`);

      // Charger toutes les conversations de l'utilisateur
      const conversations = await prisma.conversationMember.findMany({
        where: { userId },
        select: { conversationId: true },
      });

      // Rejoindre toutes les conversations
      for (const conv of conversations) {
        await socket.join(`conversation:${conv.conversationId}`);
      }

      /**
       * Événement: Envoi d'un message
       */
      socket.on("message:send", async (data) => {
        try {
          const { conversationId, content, attachments } = data;

          // Vérifier que l'utilisateur est membre de la conversation
          const membership = await prisma.conversationMember.findUnique({
            where: {
              conversationId_userId: {
                conversationId,
                userId,
              },
            },
          });

          if (!membership) {
            socket.emit("error", {
              message: "Vous n'êtes pas membre de cette conversation",
              code: "NOT_MEMBER",
            });
            return;
          }

          // Créer le message en base
          const message = await prisma.message.create({
            data: {
              conversationId,
              senderId: userId,
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

          // Récupérer tous les membres de la conversation
          const members = await prisma.conversationMember.findMany({
            where: { conversationId },
            select: { userId: true },
          });

          // Créer les reçus de message pour chaque membre
          const receipts = await Promise.all(
            members.map((member) =>
              prisma.messageReceipt.create({
                data: {
                  messageId: message.id,
                  userId: member.userId,
                  status: member.userId === userId ? "READ" : "DELIVERED",
                },
              })
            )
          );

          // Diffuser le message à tous les membres de la conversation
          io.to(`conversation:${conversationId}`).emit("message:new", {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            attachments: message.attachments,
            createdAt: message.createdAt,
            sender: message.sender,
          });
        } catch (error) {
          console.error(
            "[Socket.IO] Erreur lors de l'envoi du message:",
            error
          );
          socket.emit("error", {
            message: "Erreur lors de l'envoi du message",
            code: "SEND_ERROR",
          });
        }
      });

      /**
       * Événement: Marquer un message comme lu
       */
      socket.on("message:read", async (data) => {
        try {
          const { messageId } = data;

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
            socket.emit("error", {
              message: "Message non trouvé ou accès refusé",
              code: "MESSAGE_NOT_FOUND",
            });
            return;
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
            io.to(`user:${message.senderId}`).emit("message:read", {
              messageId,
              userId,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.error(
            "[Socket.IO] Erreur lors de la lecture du message:",
            error
          );
          socket.emit("error", {
            message: "Erreur lors de la mise à jour du statut",
            code: "READ_ERROR",
          });
        }
      });

      /**
       * Événement: Rejoindre une conversation
       */
      socket.on("join:conversation", async (data) => {
        try {
          const { conversationId } = data;

          // Vérifier que l'utilisateur est membre
          const membership = await prisma.conversationMember.findUnique({
            where: {
              conversationId_userId: {
                conversationId,
                userId,
              },
            },
          });

          if (!membership) {
            socket.emit("error", {
              message: "Vous n'êtes pas membre de cette conversation",
              code: "NOT_MEMBER",
            });
            return;
          }

          await socket.join(`conversation:${conversationId}`);
          socket.emit("conversation:joined", { conversationId });
        } catch (error) {
          console.error("[Socket.IO] Erreur lors de la jointure:", error);
          socket.emit("error", {
            message: "Erreur lors de la jointure à la conversation",
            code: "JOIN_ERROR",
          });
        }
      });

      /**
       * Événement: Quitter une conversation
       */
      socket.on("leave:conversation", async (data) => {
        try {
          const { conversationId } = data;
          await socket.leave(`conversation:${conversationId}`);
        } catch (error) {
          console.error("[Socket.IO] Erreur lors de la sortie:", error);
        }
      });

      /**
       * Gestion de la déconnexion
       */
      socket.on("disconnect", (reason) => {});
    } catch (error) {
      console.error("[Socket.IO] Erreur lors de la connexion:", error);
      socket.emit("error", {
        message: "Erreur lors de l'initialisation de la connexion",
        code: "INIT_ERROR",
      });
    }
  });

  globalThis.io = io;
  return io;
}

/**
 * Obtient l'instance Socket.IO existante
 */
export function getSocketIO() {
  return globalThis.io;
}
