/**
 * Test de connexion Socket.IO avec l'origine de production
 */

import { io } from "socket.io-client";

const SOCKET_URL = "https://socket.teamify.onlinemichel.dev";
const ORIGIN = "https://teamify.onlinemichel.dev"; // URL de production de votre app

console.log("🔌 Test de connexion Socket.IO avec origine de production");
console.log(`📍 Socket URL: ${SOCKET_URL}`);
console.log(`🌐 Origin: ${ORIGIN}`);

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: false,
  timeout: 10000,
  extraHeaders: {
    Origin: ORIGIN,
  },
});

socket.on("connect", () => {
  console.log("✅ Connexion réussie !");
  console.log(`🔌 Socket ID: ${socket.id}`);
  console.log(`🌐 Transport: ${socket.io.engine.transport.name}`);

  // Test ping
  socket.emit("ping", { message: "Test avec origine de production" });
});

socket.on("pong", (data) => {
  console.log("📡 Pong reçu:", data);
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (error) => {
  console.error("❌ Erreur de connexion:", error.message);
  console.error("Type d'erreur:", error.type);
  console.error("Description:", error.description);
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
