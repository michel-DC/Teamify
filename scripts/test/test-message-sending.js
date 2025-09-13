/**
 * Script de test pour diagnostiquer le problème d'envoi de messages
 *
 * Ce script teste l'envoi de messages via Socket.IO
 */

import { io } from "socket.io-client";

console.log("🧪 Test de l'envoi de messages...");

// Configuration de test
const SOCKET_URL = "http://localhost:3000";
const TEST_TOKEN = "demo_token"; // Token de démonstration

/**
 * Test de connexion Socket.IO
 */
async function testSocketConnection() {
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
    let authenticated = false;

    // Timeout de 5 secondes
    const timeout = setTimeout(() => {
      if (!connected) {
        console.log("❌ Timeout de connexion");
        socket.disconnect();
        resolve(false);
      }
    }, 5000);

    socket.on("connect", () => {
      console.log("✅ Socket connecté");
      connected = true;
      clearTimeout(timeout);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Erreur de connexion:", error.message);
      clearTimeout(timeout);
      resolve(false);
    });

    socket.on("error", (error) => {
      console.log("❌ Erreur Socket.IO:", error);
    });

    // Test d'envoi de message après connexion
    socket.on("connect", () => {
      console.log("📤 Test d'envoi de message...");

      // Utiliser une conversation de test (ID fictif)
      const testMessage = {
        conversationId: "test-conversation-id",
        content: "Message de test",
      };

      socket.emit("message:send", testMessage);

      // Attendre la réponse
      setTimeout(() => {
        console.log("✅ Test d'envoi terminé");
        socket.disconnect();
        resolve(true);
      }, 2000);
    });
  });
}

/**
 * Test de l'API de création de conversation
 */
async function testConversationCreation() {
  console.log("\n💬 Test de création de conversation...");

  try {
    const response = await fetch(`${SOCKET_URL}/api/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "PRIVATE",
        title: "Test Conversation",
        memberIds: [],
      }),
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 401) {
      console.log("✅ API protégée correctement (authentification requise)");
      return true;
    } else if (response.ok) {
      const conversationData = await response.json();
      console.log("✅ Conversation créée:", conversationData.id);
      return conversationData;
    } else {
      const errorData = await response.json();
      console.log("❌ Erreur API:", errorData);
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur de connexion:", error.message);
    return false;
  }
}

/**
 * Test complet d'envoi de message avec une vraie conversation
 */
async function testRealMessageSending() {
  console.log("\n📨 Test d'envoi de message avec vraie conversation...");

  // D'abord, créer une conversation
  const conversation = await testConversationCreation();
  if (!conversation || typeof conversation === "boolean") {
    console.log("❌ Impossible de créer une conversation pour le test");
    return false;
  }

  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      auth: {
        token: TEST_TOKEN,
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      console.log("❌ Timeout du test d'envoi");
      socket.disconnect();
      resolve(false);
    }, 10000);

    socket.on("connect", () => {
      console.log("✅ Socket connecté pour le test d'envoi");

      // Rejoindre la conversation
      socket.emit("join:conversation", { conversationId: conversation.id });

      // Attendre un peu puis envoyer un message
      setTimeout(() => {
        const testMessage = {
          conversationId: conversation.id,
          content: "Message de test via Socket.IO",
        };

        console.log("📤 Envoi du message:", testMessage);
        socket.emit("message:send", testMessage);
      }, 1000);
    });

    socket.on("message:new", (data) => {
      console.log("✅ Message reçu:", data);
      clearTimeout(timeout);
      socket.disconnect();
      resolve(true);
    });

    socket.on("error", (error) => {
      console.log("❌ Erreur lors de l'envoi:", error);
      clearTimeout(timeout);
      socket.disconnect();
      resolve(false);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Erreur de connexion:", error.message);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log("🚀 Démarrage des tests d'envoi de messages...");
  console.log(`📡 URL Socket.IO: ${SOCKET_URL}`);

  const results = [];

  // Test 1: Connexion Socket.IO basique
  results.push(await testSocketConnection());

  // Test 2: Envoi de message avec vraie conversation
  results.push(await testRealMessageSending());

  // Résultats
  const successCount = results.filter(Boolean).length;
  const totalTests = results.length;

  console.log("\n📊 Résultats des tests:");
  console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);

  if (successCount === totalTests) {
    console.log("🎉 Tous les tests sont passés avec succès !");
    console.log("✅ L'envoi de messages fonctionne correctement");
  } else {
    console.log("⚠️  Certains tests ont échoué");
    console.log("🔧 Vérifiez la configuration Socket.IO et l'authentification");
  }

  return successCount === totalTests;
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
