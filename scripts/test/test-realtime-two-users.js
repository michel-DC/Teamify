/**
 * Script de test pour simuler deux utilisateurs et tester la communication en temps réel
 */

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";
const API_URL = "http://localhost:3000";
const CONVERSATION_ID = "cmfcshnxp000550eauiymbt8g";

async function testRealtimeTwoUsers() {
  console.log("🧪 Test de communication en temps réel entre deux utilisateurs");
  console.log("=".repeat(70));

  try {
    // 1. Créer deux connexions Socket.IO (simulant deux utilisateurs)
    console.log("1️⃣ Création des connexions Socket.IO...");

    const user1 = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const user2 = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    return new Promise((resolve) => {
      let user1Connected = false;
      let user2Connected = false;
      let messagesReceived = 0;
      const expectedMessages = 2; // 2 messages attendus

      // Configuration User 1
      user1.on("connect", () => {
        console.log("✅ User 1 connecté");
        user1Connected = true;

        // User 1 rejoint la conversation
        user1.emit("join:conversation", { conversationId: CONVERSATION_ID });
      });

      user1.on("conversation:joined", (data) => {
        console.log(
          "✅ User 1 a rejoint la conversation:",
          data.conversationId
        );
      });

      user1.on("message:new", (messageData) => {
        console.log("📨 User 1 a reçu un message:", {
          id: messageData.id,
          content: messageData.content,
          senderId: messageData.senderId,
        });
        messagesReceived++;

        if (messagesReceived >= expectedMessages) {
          console.log("✅ Test terminé avec succès !");
          user1.disconnect();
          user2.disconnect();
          resolve(true);
        }
      });

      // Configuration User 2
      user2.on("connect", () => {
        console.log("✅ User 2 connecté");
        user2Connected = true;

        // User 2 rejoint la conversation
        user2.emit("join:conversation", { conversationId: CONVERSATION_ID });

        // Attendre un peu puis envoyer un message
        setTimeout(() => {
          console.log("\n2️⃣ User 2 envoie un message...");
          user2.emit("message:send", {
            conversationId: CONVERSATION_ID,
            content: `Message de User 2 - ${new Date().toLocaleTimeString()}`,
          });
        }, 2000);
      });

      user2.on("conversation:joined", (data) => {
        console.log(
          "✅ User 2 a rejoint la conversation:",
          data.conversationId
        );
      });

      user2.on("message:new", (messageData) => {
        console.log("📨 User 2 a reçu un message:", {
          id: messageData.id,
          content: messageData.content,
          senderId: messageData.senderId,
        });
        messagesReceived++;

        if (messagesReceived >= expectedMessages) {
          console.log("✅ Test terminé avec succès !");
          user1.disconnect();
          user2.disconnect();
          resolve(true);
        }
      });

      // Gestion des erreurs
      user1.on("connect_error", (error) => {
        console.error("❌ Erreur connexion User 1:", error.message);
        resolve(false);
      });

      user2.on("connect_error", (error) => {
        console.error("❌ Erreur connexion User 2:", error.message);
        resolve(false);
      });

      user1.on("error", (error) => {
        console.error("❌ Erreur User 1:", error);
        resolve(false);
      });

      user2.on("error", (error) => {
        console.error("❌ Erreur User 2:", error);
        resolve(false);
      });

      // Timeout après 15 secondes
      setTimeout(() => {
        console.log("⏰ Timeout atteint");
        console.log(`Messages reçus: ${messagesReceived}/${expectedMessages}`);
        user1.disconnect();
        user2.disconnect();
        resolve(messagesReceived >= expectedMessages);
      }, 15000);
    });
  } catch (error) {
    console.error("❌ Erreur générale:", error);
    return false;
  }
}

// Exécuter le test
testRealtimeTwoUsers()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Test de communication en temps réel réussi !");
      console.log("✅ Les messages sont bien transmis entre utilisateurs");
    } else {
      console.log("\n💥 Le test de communication en temps réel a échoué");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
