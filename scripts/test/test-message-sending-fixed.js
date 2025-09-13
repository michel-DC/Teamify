/**
 * Script de test pour l'envoi de messages avec le serveur simple
 */

import { io } from "socket.io-client";

console.log("🧪 Test d'envoi de messages avec serveur simple...");

// Configuration de test
const SOCKET_URL = "http://localhost:3000";
const TEST_TOKEN = "demo_token";

/**
 * Test de connexion et d'envoi de message
 */
async function testMessageSending() {
  console.log("\n🔌 Test de connexion Socket.IO...");

  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      auth: {
        token: TEST_TOKEN,
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: false,
    });

    let connected = false;
    let messageSent = false;

    // Timeout de 10 secondes
    const timeout = setTimeout(() => {
      if (!connected) {
        console.log("❌ Timeout de connexion");
        socket.disconnect();
        resolve(false);
      } else if (!messageSent) {
        console.log("❌ Timeout d'envoi de message");
        socket.disconnect();
        resolve(false);
      }
    }, 10000);

    socket.on("connect", () => {
      console.log("✅ Socket connecté avec succès !");
      console.log("🔗 ID de connexion:", socket.id);
      connected = true;

      // Attendre un peu puis envoyer un message
      setTimeout(() => {
        console.log("📤 Envoi d'un message de test...");

        const testMessage = {
          conversationId: "test-conversation-123",
          content: "Message de test depuis le script",
        };

        socket.emit("message:send", testMessage);
        messageSent = true;
        console.log("✅ Message envoyé:", testMessage);
      }, 1000);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Erreur de connexion:", error.message);
      clearTimeout(timeout);
      resolve(false);
    });

    socket.on("error", (error) => {
      console.log("❌ Erreur Socket.IO:", error);
    });

    socket.on("message:new", (data) => {
      console.log("📨 Message reçu:", data);
      clearTimeout(timeout);
      socket.disconnect();
      resolve(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Déconnecté:", reason);
    });
  });
}

/**
 * Test de création de conversation via API
 */
async function testConversationCreation() {
  console.log("\n💬 Test de création de conversation...");

  try {
    const response = await fetch(`${SOCKET_URL}/api/conversations/demo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(
        "✅ Conversations de démo récupérées:",
        data.conversations?.length || 0
      );
      return data.conversations?.[0]?.id || "test-conversation-123";
    } else {
      console.log("❌ Erreur API:", response.status);
      return "test-conversation-123";
    }
  } catch (error) {
    console.log("❌ Erreur de connexion:", error.message);
    return "test-conversation-123";
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log("🚀 Démarrage des tests d'envoi de messages...");
  console.log(`📡 URL Socket.IO: ${SOCKET_URL}`);

  // Test 1: Récupérer une conversation
  const conversationId = await testConversationCreation();

  // Test 2: Connexion et envoi de message
  const success = await testMessageSending();

  console.log("\n📊 Résultats des tests:");

  if (success) {
    console.log("🎉 Test d'envoi de messages réussi !");
    console.log("✅ Socket.IO fonctionne correctement");
    console.log("💡 Le problème d'envoi de messages est résolu");
  } else {
    console.log("⚠️  Test d'envoi de messages échoué");
    console.log("🔧 Vérifiez que le serveur Socket.IO est démarré:");
    console.log("   pnpm run dev:full");
  }

  return success;
}

// Exécuter les tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Erreur lors de l'exécution des tests:", error);
    process.exit(1);
  });
