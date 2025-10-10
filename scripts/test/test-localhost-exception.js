/**
 * Test de l'exception localhost pour le développement
 */

import { io } from "socket.io-client";

const SOCKET_URL = "https://socket.teamify.onlinemichel.dev";

console.log("🚀 Test de l'exception localhost pour le développement");
console.log(`📍 URL: ${SOCKET_URL}`);
console.log("=".repeat(60));

async function testLocalhostException() {
  console.log("\n1️⃣ Test de connexion depuis localhost...");

  const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: false,
    timeout: 10000,
  });

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log("⏰ Timeout de connexion");
      socket.disconnect();
      resolve(false);
    }, 15000);

    socket.on("connect", () => {
      clearTimeout(timeout);
      console.log("✅ Connexion réussie depuis localhost !");
      console.log(`🔌 Socket ID: ${socket.id}`);
      console.log(`🌐 Transport: ${socket.io.engine.transport.name}`);

      // Test ping
      console.log("\n2️⃣ Test de ping...");
      socket.emit("ping", { message: "Test depuis localhost" });

      socket.on("pong", (data) => {
        console.log("📡 Pong reçu:", data);
        console.log("✅ Communication bidirectionnelle fonctionne !");
        socket.disconnect();
        resolve(true);
      });
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      console.error("❌ Erreur de connexion:", error.message);
      console.error("Type:", error.type);
      console.error("Description:", error.description);
      resolve(false);
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Déconnexion: ${reason}`);
    });

    socket.on("welcome", (data) => {
      console.log("👋 Message de bienvenue:", data);
    });
  });
}

// Exécution du test
testLocalhostException()
  .then((success) => {
    console.log("\n" + "=".repeat(60));
    if (success) {
      console.log("🎉 EXCEPTION LOCALHOST FONCTIONNE !");
      console.log("✅ Connexion depuis localhost réussie");
      console.log("✅ Authentification bypassée");
      console.log("✅ Communication WebSocket fonctionne");
      console.log(
        "\n📋 Votre application devrait maintenant fonctionner depuis localhost:3000"
      );
    } else {
      console.log("❌ EXCEPTION LOCALHOST ÉCHOUÉE");
      console.log("⚠️ Vérifiez que le serveur Socket.IO a été redéployé");
      console.log("⚠️ Vérifiez que l'exception localhost est active");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 ERREUR:", error.message);
    process.exit(1);
  });
