import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.SOCKET_PORT || 3001; // Port pour Socket.IO

// Créer l'application Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Créer le serveur HTTP
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialiser Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true, // Support pour les anciennes versions
  });

  // Middleware d'authentification pour Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log("[Socket.IO] Aucun token fourni");
        return next(new Error("Token d'authentification requis"));
      }

      console.log("[Socket.IO] Token reçu:", token.substring(0, 10) + "...");

      // Pour la démonstration, on accepte différents types de tokens
      if (
        token === "test_token" ||
        token === "authenticated" ||
        token.length > 5
      ) {
        socket.data.userId = "test_user";
        socket.data.userUid = "test_user";
        console.log("[Socket.IO] Authentification réussie pour test_user");
        next();
      } else {
        console.log("[Socket.IO] Token invalide:", token);
        next(new Error("Token invalide"));
      }
    } catch (error) {
      console.error("[Socket.IO] Erreur d'authentification:", error);
      next(new Error("Erreur d'authentification"));
    }
  });

  // Gestion des connexions Socket.IO
  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(
      `[Socket.IO] ✅ Utilisateur connecté: ${userId} (Socket ID: ${socket.id})`
    );

    // Rejoindre la room utilisateur
    socket.join(`user:${userId}`);
    console.log(
      `[Socket.IO] Utilisateur ${userId} a rejoint sa room personnelle`
    );

    // Événement: Envoi d'un message
    socket.on("message:send", (data) => {
      console.log(`[Socket.IO] 📨 Message reçu de ${userId}:`, data);

      // Simuler l'envoi du message
      const messageData = {
        id: `msg_${Date.now()}`,
        conversationId: data.conversationId,
        senderId: userId,
        content: data.content,
        attachments: data.attachments,
        createdAt: new Date(),
        sender: {
          uid: userId,
          firstname: "Test",
          lastname: "User",
          profileImage: null,
        },
      };

      // Diffuser le message à tous les membres de la conversation
      io.to(`conversation:${data.conversationId}`).emit(
        "message:new",
        messageData
      );
      console.log(
        `[Socket.IO] Message diffusé à conversation:${data.conversationId}`
      );
    });

    // Événement: Marquer un message comme lu
    socket.on("message:read", (data) => {
      console.log(
        `[Socket.IO] ✅ Message marqué comme lu par ${userId}:`,
        data
      );

      // Notifier l'expéditeur
      io.to(`user:${data.senderId || "unknown"}`).emit("message:read", {
        messageId: data.messageId,
        userId: userId,
        timestamp: new Date(),
      });
    });

    // Événement: Rejoindre une conversation
    socket.on("join:conversation", (data) => {
      console.log(
        `[Socket.IO] 🏠 ${userId} rejoint la conversation:`,
        data.conversationId
      );
      socket.join(`conversation:${data.conversationId}`);
      socket.emit("conversation:joined", {
        conversationId: data.conversationId,
      });
    });

    // Événement: Quitter une conversation
    socket.on("leave:conversation", (data) => {
      console.log(
        `[Socket.IO] 🚪 ${userId} quitte la conversation:`,
        data.conversationId
      );
      socket.leave(`conversation:${data.conversationId}`);
    });

    // Événement: Test de ping
    socket.on("ping", () => {
      console.log(`[Socket.IO] 🏓 Ping reçu de ${userId}`);
      socket.emit("pong", { timestamp: new Date() });
    });

    // Gestion de la déconnexion
    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] ❌ Utilisateur ${userId} déconnecté: ${reason}`);
    });

    // Envoyer un message de bienvenue
    socket.emit("welcome", {
      message: "Connexion Socket.IO établie avec succès!",
      userId: userId,
      timestamp: new Date(),
    });
  });

  // Gestion des erreurs Socket.IO
  io.on("error", (error) => {
    console.error("[Socket.IO] Erreur serveur:", error);
  });

  // Démarrer le serveur
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Serveur Next.js démarré sur http://${hostname}:${port}`);
    console.log(`🔌 Socket.IO server actif sur le port ${port}`);
    console.log(`📡 Transport: WebSocket + Polling`);
    console.log(
      `🌐 CORS: ${
        dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL
      }`
    );
  });

  // Gestion propre de l'arrêt
  process.on("SIGTERM", () => {
    console.log("[Socket.IO] Arrêt du serveur...");
    httpServer.close(() => {
      console.log("[Socket.IO] Serveur arrêté proprement");
      process.exit(0);
    });
  });
});
