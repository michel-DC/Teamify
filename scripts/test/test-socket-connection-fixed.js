/**
 * Script de test pour vérifier la connexion Socket.IO avec l'authentification par cookies
 */

import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.SOCKET_URL || "https://socket.teamify.onlinemichel.dev";

async function testSocketConnection() {
  console.log(
    "🧪 Test de connexion Socket.IO avec authentification par cookies"
  );
  console.log("=".repeat(60));

  try {
    // 1. Tester la connexion Socket.IO avec withCredentials
    console.log("1️⃣ Test de connexion Socket.IO...");

    const socket = io(SOCKET_URL, {
      withCredentials: true, // Inclure les cookies
      transports: ["websocket", "polling"],
    });

    return new Promise((resolve) => {
      let connected = false;

      socket.on("connect", () => {
        console.log("✅ Connexion Socket.IO réussie !");
        console.log("Socket ID:", socket.id);
        connected = true;

        // Tester l'événement ping
        socket.emit("ping");
      });

      socket.on("pong", (data) => {
        console.log("✅ Pong reçu:", data);
        socket.disconnect();
        resolve(true);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Erreur de connexion:", error.message);
        resolve(false);
      });

      socket.on("error", (error) => {
        console.error("❌ Erreur Socket.IO:", error);
        resolve(false);
      });

      // Timeout après 5 secondes
      setTimeout(() => {
        if (!connected) {
          console.log("⏰ Timeout - connexion non établie");
          socket.disconnect();
          resolve(false);
        }
      }, 5000);
    });
  } catch (error) {
    console.error("❌ Erreur générale:", error);
    return false;
  }
}

// Exécuter le test
testSocketConnection()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Test de connexion Socket.IO réussi !");
      console.log("✅ L'authentification par cookies fonctionne correctement");
    } else {
      console.log("\n💥 Le test de connexion a échoué");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
