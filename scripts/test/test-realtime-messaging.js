/**
 * Script de test pour vérifier la mise à jour en temps réel des messages
 */

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";
const API_URL = "http://localhost:3000";

async function testRealtimeMessaging() {
  console.log("🧪 Test de la mise à jour en temps réel des messages");
  console.log("=".repeat(60));

  try {
    // 1. Tester la connexion Socket.IO
    console.log("1️⃣ Test de connexion Socket.IO...");

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    return new Promise((resolve) => {
      let connected = false;
      let messageReceived = false;

      socket.on("connect", () => {
        console.log("✅ Connexion Socket.IO réussie !");
        connected = true;

        // 2. Rejoindre une conversation de test
        console.log("\n2️⃣ Rejoindre la conversation de test...");
        socket.emit("join:conversation", {
          conversationId: "cmfcshnxp000550eauiymbt8g",
        });

        // 3. Envoyer un message de test
        console.log("\n3️⃣ Envoi d'un message de test...");
        socket.emit("message:send", {
          conversationId: "cmfcshnxp000550eauiymbt8g",
          content: `Test de message en temps réel - ${new Date().toLocaleTimeString()}`,
        });
      });

      socket.on("conversation:joined", (data) => {
        console.log("✅ Conversation rejointe:", data);
      });

      socket.on("message:new", (messageData) => {
        console.log("✅ Message reçu en temps réel:", {
          id: messageData.id,
          content: messageData.content,
          sender: messageData.sender,
          timestamp: messageData.createdAt,
        });
        messageReceived = true;

        // 4. Tester l'API des messages
        console.log("\n4️⃣ Vérification via l'API...");
        testMessageAPI();
      });

      socket.on("error", (error) => {
        console.error("❌ Erreur Socket.IO:", error);
        resolve(false);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Erreur de connexion:", error.message);
        resolve(false);
      });

      // Timeout après 10 secondes
      setTimeout(() => {
        if (!connected) {
          console.log("⏰ Timeout - connexion non établie");
          socket.disconnect();
          resolve(false);
        } else if (!messageReceived) {
          console.log("⏰ Timeout - message non reçu");
          socket.disconnect();
          resolve(false);
        } else {
          console.log("✅ Test terminé avec succès");
          socket.disconnect();
          resolve(true);
        }
      }, 10000);
    });
  } catch (error) {
    console.error("❌ Erreur générale:", error);
    return false;
  }
}

async function testMessageAPI() {
  try {
    const response = await fetch(
      `${API_URL}/api/conversations/cmfcshnxp000550eauiymbt8g/messages`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API des messages accessible:", {
        count: data.messages?.length || 0,
        lastMessage:
          data.messages?.[data.messages.length - 1]?.content || "Aucun",
      });
    } else {
      console.log("❌ Erreur API des messages:", response.status);
    }
  } catch (error) {
    console.log("❌ Erreur lors de la vérification API:", error.message);
  }
}

// Exécuter le test
testRealtimeMessaging()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Test de messagerie en temps réel réussi !");
      console.log("✅ Les messages s'affichent maintenant en temps réel");
    } else {
      console.log("\n💥 Le test de messagerie en temps réel a échoué");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
