/**
 * Script de test complet pour le système de messagerie
 */

import fetch from "node-fetch";
import { io } from "socket.io-client";

console.log("🧪 Test complet du système de messagerie...");

const BASE_URL = "http://localhost:3000";
const TEST_TOKEN = "demo_token";

/**
 * Test 1: Vérifier que les APIs fonctionnent
 */
async function testAPIs() {
  console.log("\n📡 Test des APIs...");

  try {
    // Test API de démonstration
    const response = await fetch(`${BASE_URL}/api/conversations/demo`);
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API de démonstration fonctionne");
      return data.conversations?.[0]?.id || null;
    } else {
      console.log("❌ API de démonstration échouée:", response.status);
      return null;
    }
  } catch (error) {
    console.log("❌ Erreur API:", error.message);
    return null;
  }
}

/**
 * Test 2: Vérifier la connexion Socket.IO
 */
async function testSocketConnection() {
  console.log("\n🔌 Test de connexion Socket.IO...");

  return new Promise((resolve) => {
    const socket = io(BASE_URL, {
      auth: { token: TEST_TOKEN },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      console.log("❌ Timeout de connexion Socket.IO");
      socket.disconnect();
      resolve(false);
    }, 5000);

    socket.on("connect", () => {
      console.log("✅ Socket.IO connecté");
      clearTimeout(timeout);
      socket.disconnect();
      resolve(true);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Erreur de connexion Socket.IO:", error.message);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

/**
 * Test 3: Test d'envoi de message complet
 */
async function testMessageSending(conversationId) {
  console.log("\n📤 Test d'envoi de message...");

  if (!conversationId) {
    console.log("❌ Aucune conversation disponible pour le test");
    return false;
  }

  return new Promise((resolve) => {
    const socket = io(BASE_URL, {
      auth: { token: TEST_TOKEN },
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
      console.log("✅ Socket connecté pour l'envoi");

      // Rejoindre la conversation
      socket.emit("join:conversation", { conversationId });

      setTimeout(() => {
        const message = {
          conversationId,
          content: "Test d'envoi de message complet",
        };

        console.log("📤 Envoi du message:", message);
        socket.emit("message:send", message);
      }, 1000);
    });

    socket.on("message:new", (data) => {
      console.log("✅ Message reçu:", data.content);
      clearTimeout(timeout);
      socket.disconnect();
      resolve(true);
    });

    socket.on("error", (error) => {
      console.log("❌ Erreur Socket.IO:", error);
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
  console.log("🚀 Démarrage des tests complets...");

  const results = [];

  // Test 1: APIs
  const conversationId = await testAPIs();
  results.push(!!conversationId);

  // Test 2: Connexion Socket.IO
  results.push(await testSocketConnection());

  // Test 3: Envoi de message
  results.push(await testMessageSending(conversationId));

  // Résultats
  const successCount = results.filter(Boolean).length;
  const totalTests = results.length;

  console.log("\n📊 Résultats des tests:");
  console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);

  if (successCount === totalTests) {
    console.log("🎉 Tous les tests sont passés !");
    console.log("✅ Le système de messagerie fonctionne correctement");
    console.log(
      "💡 L'envoi de messages devrait maintenant fonctionner dans l'interface"
    );
  } else {
    console.log("⚠️  Certains tests ont échoué");
    console.log("🔧 Solutions possibles:");
    console.log("   1. Lancez le serveur: pnpm run dev:full");
    console.log("   2. Vérifiez que le port 3000 est libre");
    console.log("   3. Vérifiez les logs du serveur pour plus de détails");
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
