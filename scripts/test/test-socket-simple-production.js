/**
 * Test simple de connexion au serveur Socket.IO de production
 */

import { io } from "socket.io-client";

const SOCKET_URL = "https://socket.teamify.onlinemichel.dev";

console.log("🔌 Test simple de connexion Socket.IO");
console.log(`📍 URL: ${SOCKET_URL}`);

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: false,
  timeout: 10000,
});

socket.on("connect", () => {
  console.log("✅ Connexion réussie !");
  console.log(`🔌 Socket ID: ${socket.id}`);
  console.log(`🌐 Transport: ${socket.io.engine.transport.name}`);

  // Test ping
  socket.emit("ping", { message: "Test simple" });
});

socket.on("pong", (data) => {
  console.log("📡 Pong reçu:", data);
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (error) => {
  console.error("❌ Erreur de connexion:", error.message);
  console.error("Détails:", error);
  process.exit(1);
});

socket.on("disconnect", (reason) => {
  console.log(`🔌 Déconnexion: ${reason}`);
});

// Timeout après 15 secondes
setTimeout(() => {
  console.log("⏰ Timeout atteint");
  socket.disconnect();
  process.exit(1);
}, 15000);
