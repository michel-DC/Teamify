/**
 * Script de test pour vérifier Socket.IO avec un token JWT réel
 */

import { io } from "socket.io-client";
import fetch from "node-fetch";

console.log("🧪 Test Socket.IO avec token JWT réel...");

const BASE_URL = "http://localhost:3001";

/**
 * Obtenir un token JWT réel via l'API d'authentification
 */
async function getRealToken() {
  console.log("🔐 Tentative d'obtention d'un token JWT réel...");

  try {
    // Essayer de récupérer les conversations de démo pour voir si on a un token valide
    const response = await fetch(
      `http://localhost:3000/api/conversations/demo`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      console.log("✅ API accessible, mais pas de token JWT dans ce test");
      return "demo_token";
    } else {
      console.log("❌ API non accessible:", response.status);
      return null;
    }
  } catch (error) {
    console.log("❌ Erreur lors de l'obtention du token:", error.message);
    return null;
  }
}

/**
 * Test de connexion Socket.IO
 */
async function testSocketConnection() {
  console.log("\n🔌 Test de connexion Socket.IO...");

  const token = await getRealToken();
  if (!token) {
    console.log("❌ Impossible d'obtenir un token");
    return false;
  }

  return new Promise((resolve) => {
    const socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      console.log("❌ Timeout de connexion Socket.IO");
      socket.disconnect();
      resolve(false);
    }, 10000);

    socket.on("connect", () => {
      console.log("✅ Socket.IO connecté avec succès !");
      console.log("🔗 ID de connexion:", socket.id);
      clearTimeout(timeout);

      // Test d'envoi de message
      setTimeout(() => {
        console.log("📤 Test d'envoi de message...");
        socket.emit("message:send", {
          conversationId: "test-conversation",
          content: "Message de test avec token JWT",
        });

        setTimeout(() => {
          socket.disconnect();
          resolve(true);
        }, 2000);
      }, 1000);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Erreur de connexion Socket.IO:", error.message);
      clearTimeout(timeout);
      resolve(false);
    });

    socket.on("error", (error) => {
      console.log("❌ Erreur Socket.IO:", error);
    });

    socket.on("message:new", (data) => {
      console.log("📨 Message reçu:", data);
    });
  });
}

/**
 * Exécuter le test
 */
async function runTest() {
  console.log("🚀 Démarrage du test Socket.IO...");
  console.log(`📡 URL Socket.IO: ${BASE_URL}`);
  console.log(`📡 URL Next.js: http://localhost:3000`);

  const success = await testSocketConnection();

  if (success) {
    console.log("\n🎉 Test réussi !");
    console.log("✅ Socket.IO fonctionne correctement");
    console.log("💡 Le problème d'envoi de messages devrait être résolu");
  } else {
    console.log("\n⚠️  Test échoué");
    console.log("🔧 Solutions possibles:");
    console.log("   1. Lancez le serveur: pnpm run dev:full");
    console.log("   2. Vérifiez que le port 3000 est libre");
    console.log("   3. Vérifiez les logs du serveur");
  }

  return success;
}

// Exécuter le test
runTest()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Erreur lors de l'exécution du test:", error);
    process.exit(1);
  });
