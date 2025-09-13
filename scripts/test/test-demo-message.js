/**
 * Script de test pour les messages de démo
 */

import fetch from "node-fetch";
import { io } from "socket.io-client";

console.log("🧪 Test des messages de démo...");

async function testDemoMessage() {
  try {
    // 1. Récupérer une conversation de démo
    console.log("1. Récupération d'une conversation...");
    const conversationsResponse = await fetch(
      "http://localhost:3000/api/conversations/demo"
    );

    if (!conversationsResponse.ok) {
      console.log("❌ Impossible de récupérer les conversations");
      return false;
    }

    const conversationsData = await conversationsResponse.json();
    const conversationId = conversationsData.conversations?.[0]?.id;

    if (!conversationId) {
      console.log("❌ Aucune conversation trouvée");
      return false;
    }

    console.log("✅ Conversation trouvée:", conversationId);

    // 2. Tester la création de message via API avec token de démo
    console.log("2. Test de création de message via API (mode démo)...");
    const messageResponse = await fetch(
      `http://localhost:3000/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "token=demo_jwt_token",
        },
        body: JSON.stringify({
          content: "Message de test via API (mode démo)",
        }),
      }
    );

    console.log(`Status API: ${messageResponse.status}`);

    if (messageResponse.ok) {
      const messageData = await messageResponse.json();
      console.log("✅ Message créé via API (mode démo):", messageData.id);
    } else {
      const errorData = await messageResponse.json();
      console.log("❌ Erreur API:", errorData);
    }

    // 3. Tester la création de message via Socket.IO
    console.log("3. Test de création de message via Socket.IO...");

    return new Promise((resolve) => {
      const socket = io("http://localhost:3001", {
        auth: { token: "demo_token" },
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: false,
      });

      const timeout = setTimeout(() => {
        console.log("❌ Timeout Socket.IO");
        socket.disconnect();
        resolve(false);
      }, 10000);

      socket.on("connect", () => {
        console.log("✅ Socket connecté");

        // Rejoindre la conversation
        socket.emit("join:conversation", { conversationId });

        setTimeout(() => {
          // Envoyer un message
          socket.emit("message:send", {
            conversationId,
            content: "Message de test via Socket.IO (mode démo)",
          });
          console.log("📤 Message envoyé via Socket.IO");
        }, 1000);
      });

      socket.on("message:new", (data) => {
        console.log("✅ Message reçu via Socket.IO:", data.id);
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
  } catch (error) {
    console.log("❌ Erreur:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Test des messages de démo...\n");

  const success = await testDemoMessage();

  if (success) {
    console.log("\n🎉 Test réussi !");
    console.log("✅ Les messages de démo fonctionnent correctement");
    console.log("💡 L'envoi de messages devrait maintenant fonctionner");
  } else {
    console.log("\n⚠️  Test échoué");
    console.log("🔧 Vérifiez que le serveur est démarré: pnpm run dev:full");
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });
