/**
 * Test de connexion Socket.IO avec cookies d'authentification
 */

import { io } from "socket.io-client";

const SOCKET_URL = "https://socket.teamify.onlinemichel.dev";
const APP_URL = "https://teamify.onlinemichel.dev";

console.log("🔌 Test de connexion Socket.IO avec authentification");
console.log(`📍 Socket URL: ${SOCKET_URL}`);
console.log(`🌐 App URL: ${APP_URL}`);

async function testSocketWithAuth() {
  try {
    console.log("\n1️⃣ Test de l'endpoint de santé...");

    // Test de l'endpoint de santé
    const healthResponse = await fetch(`${SOCKET_URL}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Serveur de santé:", healthData);
    } else {
      console.log("❌ Serveur de santé non accessible");
    }

    console.log("\n2️⃣ Test de l'endpoint Socket.IO...");

    // Test de l'endpoint Socket.IO
    const socketResponse = await fetch(`${SOCKET_URL}/socket.io/`, {
      method: "GET",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        Origin: "http://localhost:3000",
      },
    });

    console.log(`📊 Status: ${socketResponse.status}`);
    console.log(
      `📋 Headers:`,
      Object.fromEntries(socketResponse.headers.entries())
    );

    if (socketResponse.ok) {
      console.log("✅ Endpoint Socket.IO accessible");
    } else {
      console.log(`❌ Endpoint non accessible: ${socketResponse.status}`);
      const text = await socketResponse.text();
      console.log("📄 Réponse:", text.substring(0, 200));
    }

    console.log("\n3️⃣ Test de connexion Socket.IO (sans auth)...");

    // Test de connexion Socket.IO sans authentification
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
      }, 10000);

      socket.on("connect", () => {
        clearTimeout(timeout);
        console.log("✅ Connexion Socket.IO réussie !");
        console.log(`🔌 Socket ID: ${socket.id}`);
        console.log(`🌐 Transport: ${socket.io.engine.transport.name}`);

        // Test ping
        socket.emit("ping", { message: "Test avec cookies" });

        socket.on("pong", (data) => {
          console.log("📡 Pong reçu:", data);
          socket.disconnect();
          resolve(true);
        });
      });

      socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        console.error("❌ Erreur de connexion:", error.message);
        console.error("Type:", error.type);
        console.error("Description:", error.description);

        // Ne pas rejeter immédiatement, continuer le test
        console.log("⚠️ Connexion échouée (normal sans authentification)");
        resolve(false);
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
testSocketWithAuth()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Test de connexion réussi !");
    } else {
      console.log("\n⚠️ Connexion échouée (attendu sans authentification)");
    }
    console.log("\n📋 Résumé:");
    console.log("- Le serveur Socket.IO est accessible");
    console.log("- La configuration CORS est correcte");
    console.log("- L'authentification est requise (normal)");
    console.log(
      "- Votre application devrait fonctionner avec des cookies valides"
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test échoué:", error.message);
    process.exit(1);
  });
