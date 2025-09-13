import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.SOCKET_PORT || 3001;

console.log("🚀 Démarrage du serveur Socket.IO...");

// Créer l'application Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    console.log("✅ Application Next.js préparée");

    // Créer le serveur HTTP
    const httpServer = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("❌ Erreur lors du traitement de la requête:", err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    });

    // Initialiser Socket.IO avec une configuration simple
    const io = new Server(httpServer, {
      cors: {
        origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Cookie", "Authorization"],
      },
      transports: ["websocket", "polling"],
      allowEIO3: true,
    });

    console.log("✅ Socket.IO initialisé");

    // Middleware d'authentification
    io.use(async (socket, next) => {
      try {
        console.log("[Socket.IO] 🔍 Vérification de l'authentification...");

        // Récupérer les cookies de la requête
        const cookies = socket.handshake.headers.cookie;
        console.log("[Socket.IO] Cookies reçus:", cookies);

        if (!cookies) {
          console.log("[Socket.IO] ❌ Aucun cookie fourni");
          return next(new Error("Cookies requis"));
        }

        // Vérifier l'authentification via l'API avec les cookies
        try {
          const response = await fetch("http://localhost:3000/api/auth/me", {
            method: "GET",
            headers: {
              Cookie: cookies,
              "Content-Type": "application/json",
            },
          });

          console.log("[Socket.IO] Réponse API auth:", {
            status: response.status,
            ok: response.ok,
          });

          if (response.ok) {
            const data = await response.json();
            socket.data.userId = data.user.uid;
            socket.data.userUid = data.user.uid;
            console.log(
              "[Socket.IO] ✅ Authentification réussie pour:",
              data.user.email
            );
            next();
          } else {
            console.log("[Socket.IO] ❌ Authentification échouée");
            next(new Error("Authentification échouée"));
          }
        } catch (apiError) {
          console.log(
            "[Socket.IO] ❌ Erreur API d'authentification:",
            apiError.message
          );
          next(new Error("Erreur d'authentification"));
        }
      } catch (error) {
        console.error("[Socket.IO] ❌ Erreur d'authentification:", error);
        next(new Error("Erreur d'authentification"));
      }
    });

    // Gestion des connexions
    io.on("connection", (socket) => {
      const userId = socket.data.userId;
      console.log(
        `[Socket.IO] 🔌 Utilisateur connecté: ${userId} (${socket.id})`
      );

      // Rejoindre la room utilisateur
      socket.join(`user:${userId}`);

      // Événement de test
      socket.on("ping", () => {
        console.log(`[Socket.IO] 📡 Ping reçu de ${userId}`);
        socket.emit("pong", {
          message: "Pong!",
          timestamp: new Date().toISOString(),
          userId: userId,
        });
      });

      // Événement d'envoi de message
      socket.on("message:send", async (data) => {
        try {
          console.log(`[Socket.IO] 📨 Message reçu:`, data);

          // Sauvegarder le message en base via l'API
          try {
            // Utiliser les cookies de la requête Socket.IO
            const cookies = socket.handshake.headers.cookie;

            const response = await fetch(
              `http://localhost:3000/api/conversations/${data.conversationId}/messages`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Cookie: cookies,
                },
                body: JSON.stringify({
                  content: data.content,
                  attachments: data.attachments,
                }),
              }
            );

            if (response.ok) {
              const messageData = await response.json();
              console.log(
                `[Socket.IO] ✅ Message sauvegardé en base:`,
                messageData.id
              );

              // Diffuser à la conversation (sauf à l'expéditeur qui a déjà le message optimiste)
              io.to(`conversation:${data.conversationId}`).emit(
                "message:new",
                messageData
              );
              console.log(
                `[Socket.IO] ✅ Message diffusé à la conversation: ${data.conversationId}`
              );
            } else {
              console.error(
                `[Socket.IO] ❌ Erreur sauvegarde:`,
                response.status
              );
              socket.emit("error", { message: "Erreur lors de la sauvegarde" });
            }
          } catch (apiError) {
            console.error(`[Socket.IO] ❌ Erreur API:`, apiError);
            socket.emit("error", { message: "Erreur de connexion à l'API" });
          }
        } catch (error) {
          console.error(`[Socket.IO] ❌ Erreur message:`, error);
          socket.emit("error", { message: "Erreur lors de l'envoi" });
        }
      });

      // Rejoindre une conversation
      socket.on("join:conversation", (data) => {
        try {
          console.log(
            `[Socket.IO] 🏠 Utilisateur ${userId} rejoint conversation: ${data.conversationId}`
          );
          socket.join(`conversation:${data.conversationId}`);
          socket.emit("conversation:joined", {
            conversationId: data.conversationId,
          });
          console.log(
            `[Socket.IO] ✅ Utilisateur ${userId} dans la room: conversation:${data.conversationId}`
          );
        } catch (error) {
          console.error(`[Socket.IO] ❌ Erreur join:`, error);
        }
      });

      // Quitter une conversation
      socket.on("leave:conversation", (data) => {
        try {
          console.log(
            `[Socket.IO] 🚪 Quitte conversation: ${data.conversationId}`
          );
          socket.leave(`conversation:${data.conversationId}`);
        } catch (error) {
          console.error(`[Socket.IO] ❌ Erreur leave:`, error);
        }
      });

      // Gestion de la déconnexion
      socket.on("disconnect", (reason) => {
        console.log(`[Socket.IO] ❌ Déconnexion: ${userId} - ${reason}`);
      });

      // Message de bienvenue
      socket.emit("welcome", {
        message: "Connexion réussie !",
        userId: userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Gestion des erreurs globales
    io.on("error", (error) => {
      console.error("[Socket.IO] ❌ Erreur globale:", error);
    });

    // Démarrer le serveur
    httpServer.listen(port, (err) => {
      if (err) {
        console.error("❌ Erreur de démarrage:", err);
        throw err;
      }
      console.log(`🚀 Serveur Socket.IO démarré sur le port ${port}`);
      console.log(`🔗 URL: http://${hostname}:${port}`);
    });

    // Gestion des signaux d'arrêt
    process.on("SIGTERM", () => {
      console.log("🛑 Signal SIGTERM reçu, arrêt du serveur...");
      httpServer.close(() => {
        console.log("✅ Serveur arrêté proprement");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("🛑 Signal SIGINT reçu, arrêt du serveur...");
      httpServer.close(() => {
        console.log("✅ Serveur arrêté proprement");
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error("❌ Erreur lors de la préparation de l'application:", error);
    process.exit(1);
  });
