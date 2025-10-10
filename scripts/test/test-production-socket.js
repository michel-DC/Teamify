/**
 * Script de test pour vérifier la connexion au serveur Socket.IO de production
 */

import { io } from "socket.io-client";

const SOCKET_URL = "https://socket.teamify.onlinemichel.dev";

console.log("🧪 Test de connexion au serveur Socket.IO de production");
console.log(`📍 URL: ${SOCKET_URL}`);

async function testProductionSocket() {
  try {
    console.log("\n1️⃣ Test de l'endpoint Socket.IO...");

    // Test de l'endpoint HTTP
    const response = await fetch(`${SOCKET_URL}/socket.io/`, {
      method: "GET",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (response.ok) {
      console.log("✅ Endpoint Socket.IO accessible");
    } else {
      console.log(`❌ Endpoint non accessible: ${response.status}`);
      return;
    }

    console.log("\n2️⃣ Test de connexion WebSocket...");

    // Test de connexion Socket.IO
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: false,
      timeout: 10000,
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log("⏰ Timeout de connexion atteint");
        socket.disconnect();
        reject(new Error("Timeout"));
      }, 15000);

      socket.on("connect", () => {
        clearTimeout(timeout);
        console.log("✅ Connexion Socket.IO réussie !");
        console.log(`🔌 Socket ID: ${socket.id}`);
        console.log(`🌐 Transport: ${socket.io.engine.transport.name}`);

        // Test ping/pong
        socket.emit("ping", { message: "Test de production" });

        socket.on("pong", (data) => {
          console.log("📡 Pong reçu:", data);
          socket.disconnect();
          resolve(true);
        });
      });

      socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        console.error("❌ Erreur de connexion:", error.message);
        reject(error);
      });

      socket.on("disconnect", (reason) => {
        console.log(`🔌 Déconnexion: ${reason}`);
      });
    });
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
    throw error;
  }
}

// Exécution du test
testProductionSocket()
  .then(() => {
    console.log("\n🎉 Test de production réussi !");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test de production échoué:", error.message);
    process.exit(1);
  });
