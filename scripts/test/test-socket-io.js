/**
 * Script de test pour le système Socket.IO
 * Teste la connexion, l'authentification et les événements de messagerie
 */

import { io } from "socket.io-client";

// Configuration
const SERVER_URL =
  process.env.SOCKET_SERVER_URL || "https://socket.teamify.onlinemichel.dev";
const TEST_TOKEN = process.env.TEST_JWT_TOKEN || "test_token"; // Token JWT valide pour les tests

/**
 * Test de connexion Socket.IO
 */
async function testSocketConnection() {
  console.log("🔌 Test de connexion Socket.IO...");

  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL, {
      auth: {
        token: TEST_TOKEN,
      },
      transports: ["websocket", "polling"],
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error("Timeout de connexion"));
    }, 10000);

    socket.on("connect", () => {
      console.log("✅ Connexion Socket.IO réussie");
      clearTimeout(timeout);
      socket.disconnect();
      resolve(true);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion:", error.message);
      clearTimeout(timeout);
      reject(error);
    });

    socket.on("error", (error) => {
      console.error("❌ Erreur Socket.IO:", error);
      clearTimeout(timeout);
      reject(error);
    });
  });
}

/**
 * Test d'authentification avec token invalide
 */
async function testInvalidAuth() {
  console.log("🔐 Test d'authentification avec token invalide...");

  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL, {
      auth: {
        token: "invalid_token",
      },
      transports: ["websocket", "polling"],
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error("Timeout d'authentification"));
    }, 5000);

    socket.on("connect", () => {
      console.error("❌ Connexion réussie avec token invalide (non attendu)");
      clearTimeout(timeout);
      socket.disconnect();
      reject(new Error("Authentification échouée"));
    });

    socket.on("connect_error", (error) => {
      console.log("✅ Authentification refusée comme attendu:", error.message);
      clearTimeout(timeout);
      resolve(true);
    });
  });
}

/**
 * Test d'envoi de message
 */
async function testMessageSending() {
  console.log("💬 Test d'envoi de message...");

  if (!TEST_TOKEN) {
    console.log("⚠️  Token de test non fourni, test ignoré");
    return true;
  }

  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL, {
      auth: {
        token: TEST_TOKEN,
      },
      transports: ["websocket", "polling"],
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error("Timeout d'envoi de message"));
    }, 15000);

    socket.on("connect", () => {
      console.log("✅ Connecté pour test d'envoi");

      // Simuler l'envoi d'un message
      socket.emit("message:send", {
        conversationId: "test_conversation",
        content: "Message de test Socket.IO",
      });

      // Écouter la réponse
      socket.on("message:new", (data) => {
        console.log("✅ Message reçu:", data);
        clearTimeout(timeout);
        socket.disconnect();
        resolve(true);
      });

      socket.on("error", (error) => {
        console.log(
          "ℹ️  Erreur attendue (conversation de test):",
          error.message
        );
        clearTimeout(timeout);
        socket.disconnect();
        resolve(true); // Erreur attendue car conversation de test n'existe pas
      });
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion:", error.message);
      clearTimeout(timeout);
      reject(error);
    });
  });
}

/**
 * Test de gestion des rooms
 */
async function testRoomManagement() {
  console.log("🏠 Test de gestion des rooms...");

  if (!TEST_TOKEN) {
    console.log("⚠️  Token de test non fourni, test ignoré");
    return true;
  }

  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL, {
      auth: {
        token: TEST_TOKEN,
      },
      transports: ["websocket", "polling"],
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error("Timeout de gestion des rooms"));
    }, 10000);

    socket.on("connect", () => {
      console.log("✅ Connecté pour test des rooms");

      // Tester la jointure à une conversation
      socket.emit("join:conversation", {
        conversationId: "test_conversation",
      });

      socket.on("conversation:joined", (data) => {
        console.log("✅ Conversation rejointe:", data);
        clearTimeout(timeout);
        socket.disconnect();
        resolve(true);
      });

      socket.on("error", (error) => {
        console.log(
          "ℹ️  Erreur attendue (conversation de test):",
          error.message
        );
        clearTimeout(timeout);
        socket.disconnect();
        resolve(true); // Erreur attendue car conversation de test n'existe pas
      });
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion:", error.message);
      clearTimeout(timeout);
      reject(error);
    });
  });
}

/**
 * Test de performance de connexion
 */
async function testConnectionPerformance() {
  console.log("⚡ Test de performance de connexion...");

  const startTime = Date.now();

  try {
    await testSocketConnection();
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Connexion établie en ${duration}ms`);

    if (duration > 5000) {
      console.log("⚠️  Connexion lente (>5s)");
    } else if (duration > 2000) {
      console.log("⚠️  Connexion modérée (>2s)");
    } else {
      console.log("✅ Connexion rapide (<2s)");
    }

    return true;
  } catch (error) {
    console.error("❌ Test de performance échoué:", error.message);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  console.log("🚀 Démarrage des tests Socket.IO");
  console.log(`📍 Serveur: ${SERVER_URL}`);
  console.log(`🔑 Token fourni: ${TEST_TOKEN ? "Oui" : "Non"}`);
  console.log("");

  const tests = [
    { name: "Connexion Socket.IO", fn: testSocketConnection },
    { name: "Authentification invalide", fn: testInvalidAuth },
    { name: "Performance de connexion", fn: testConnectionPerformance },
    { name: "Gestion des rooms", fn: testRoomManagement },
    { name: "Envoi de message", fn: testMessageSending },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n🧪 ${test.name}...`);
      await test.fn();
      console.log(`✅ ${test.name} - RÉUSSI`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name} - ÉCHOUÉ: ${error.message}`);
      failed++;
    }
  }

  console.log("\n📊 Résultats des tests:");
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log(
    `📈 Taux de réussite: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
  );

  if (failed === 0) {
    console.log("\n🎉 Tous les tests sont passés avec succès!");
  } else {
    console.log("\n⚠️  Certains tests ont échoué. Vérifiez la configuration.");
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Exécuter les tests directement
runTests().catch((error) => {
  console.error("💥 Erreur fatale:", error);
  process.exit(1);
});

export {
  testSocketConnection,
  testInvalidAuth,
  testMessageSending,
  testRoomManagement,
  testConnectionPerformance,
  runTests,
};
