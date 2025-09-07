/**
 * Test simple de connexion Socket.IO
 */

import { io } from "socket.io-client";

console.log("🔌 Test de connexion Socket.IO simple...");
console.log("📍 Serveur: http://localhost:3001");
console.log("🔑 Token: test_token");

const socket = io("http://localhost:3001", {
  auth: {
    token: "test_token",
  },
  transports: ["websocket", "polling"],
  timeout: 5000,
  forceNew: true,
});

let connected = false;

socket.on("connect", () => {
  connected = true;
  console.log("✅ Connexion réussie!");
  console.log("Socket ID:", socket.id);
  console.log("Transport:", socket.io.engine.transport.name);

  // Test de ping
  socket.emit("ping");

  // Test d'envoi de message
  socket.emit("message:send", {
    conversationId: "test_conv",
    content: "Message de test depuis le script",
  });

  // Test de jointure à une conversation
  socket.emit("join:conversation", {
    conversationId: "test_conv",
  });
});

socket.on("welcome", (data) => {
  console.log("🎉 Message de bienvenue:", data);
});

socket.on("pong", (data) => {
  console.log("🏓 Pong reçu:", data);
});

socket.on("message:new", (data) => {
  console.log("📨 Message reçu:", data);
});

socket.on("conversation:joined", (data) => {
  console.log("🏠 Conversation rejointe:", data);
});

socket.on("connect_error", (error) => {
  console.error("❌ Erreur de connexion:", error.message);
  console.error("Détails:", error);
  process.exit(1);
});

socket.on("error", (error) => {
  console.error("❌ Erreur Socket.IO:", error);
});

socket.on("disconnect", (reason) => {
  console.log("👋 Déconnexion:", reason);
  if (connected) {
    console.log("✅ Test terminé avec succès!");
    process.exit(0);
  }
});

// Timeout de 15 secondes
setTimeout(() => {
  if (!connected) {
    console.error("⏰ Timeout de connexion - Le serveur ne répond pas");
    socket.disconnect();
    process.exit(1);
  } else {
    console.log("⏰ Timeout - Déconnexion forcée");
    socket.disconnect();
    process.exit(0);
  }
}, 15000);
