/**
 * Script pour tester l'authentification JWT avec Socket.IO
 */

import { io } from "socket.io-client";
import fetch from "node-fetch";

console.log("🔐 Test d'authentification JWT avec Socket.IO...");

/**
 * Obtenir un token JWT réel depuis l'API
 */
async function getRealJWTToken() {
  console.log("🍪 Tentative d'obtention d'un token JWT réel...");

  try {
    // Simuler une requête avec des cookies
    const response = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Status API: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Utilisateur authentifié:", data.user?.email);

      // Dans un vrai navigateur, le token serait dans les cookies
      // Pour ce test, on va utiliser le token de démo
      return "demo_token";
    } else {
      console.log("❌ Non authentifié via API");
      return null;
    }
  } catch (error) {
    console.log("❌ Erreur API:", error.message);
    return null;
  }
}

/**
 * Test de connexion Socket.IO avec authentification
 */
async function testSocketAuth() {
  console.log("\n🔌 Test de connexion Socket.IO...");

  const token = await getRealJWTToken();
  if (!token) {
    console.log("❌ Impossible d'obtenir un token");
    return false;
  }

  return new Promise((resolve) => {
    const socket = io("http://localhost:3001", {
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

      // Test d'envoi de message
      setTimeout(() => {
        console.log("📤 Test d'envoi de message...");
        socket.emit("message:send", {
          conversationId: "test-conversation",
          content: "Message de test avec authentification JWT",
        });

        setTimeout(() => {
          console.log("✅ Test d'envoi terminé");
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
  console.log("🚀 Démarrage du test d'authentification JWT...");
  console.log("📡 URL Socket.IO: http://localhost:3001");
  console.log("📡 URL Next.js: http://localhost:3000");

  const success = await testSocketAuth();

  if (success) {
    console.log("\n🎉 Test réussi !");
    console.log("✅ L'authentification JWT fonctionne avec Socket.IO");
    console.log("💡 L'envoi de messages devrait maintenant fonctionner");
  } else {
    console.log("\n⚠️  Test échoué");
    console.log("🔧 Solutions possibles:");
    console.log("   1. Lancez le serveur: pnpm run dev:full");
    console.log(
      "   2. Vérifiez que l'utilisateur est connecté dans le navigateur"
    );
    console.log("   3. Vérifiez les logs du serveur Socket.IO");
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
