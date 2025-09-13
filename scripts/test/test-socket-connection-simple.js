/**
 * Script de test simple pour vérifier la connexion Socket.IO
 */

import { io } from "socket.io-client";

console.log("🧪 Test simple de connexion Socket.IO...");

const socket = io("http://localhost:3000", {
  auth: {
    token: "demo_token",
  },
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: false,
});

socket.on("connect", () => {
  console.log("✅ Socket connecté avec succès !");
  console.log("🔗 ID de connexion:", socket.id);

  // Test d'envoi d'un message simple
  socket.emit("message:send", {
    conversationId: "test-conversation",
    content: "Message de test",
  });

  console.log("📤 Message de test envoyé");

  // Fermer la connexion après 2 secondes
  setTimeout(() => {
    socket.disconnect();
    console.log("🔌 Connexion fermée");
    process.exit(0);
  }, 2000);
});

socket.on("connect_error", (error) => {
  console.log("❌ Erreur de connexion:", error.message);
  process.exit(1);
});

socket.on("error", (error) => {
  console.log("❌ Erreur Socket.IO:", error);
});

socket.on("message:new", (data) => {
  console.log("📨 Message reçu:", data);
});

// Timeout de 5 secondes
setTimeout(() => {
  console.log("❌ Timeout de connexion");
  socket.disconnect();
  process.exit(1);
}, 5000);
