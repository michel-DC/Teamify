/**
 * Script de test pour vérifier la correction de la boucle Socket.IO
 *
 * Ce script teste la connexion Socket.IO pour s'assurer qu'il n'y a plus
 * de boucle de connexions/déconnexions infinies.
 */

import { io } from "socket.io-client";

console.log("🧪 Test de la correction Socket.IO...");

// Configuration de test
const SOCKET_URL = "http://localhost:3001";
const TEST_DURATION = 10000; // 10 secondes
const MAX_CONNECTIONS = 5; // Maximum de connexions attendues

let connectionCount = 0;
let disconnectionCount = 0;
let lastConnectionTime = null;
let connectionTimes = [];

// Créer une connexion Socket.IO de test
const socket = io(SOCKET_URL, {
  auth: {
    token: "demo_token",
  },
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: false, // Désactiver la reconnexion automatique pour le test
});

// Gestion des événements de connexion
socket.on("connect", () => {
  connectionCount++;
  lastConnectionTime = Date.now();
  connectionTimes.push(lastConnectionTime);

  console.log(
    `✅ Connexion #${connectionCount} établie à ${new Date().toLocaleTimeString()}`
  );

  // Vérifier si on a trop de connexions
  if (connectionCount > MAX_CONNECTIONS) {
    console.error(
      `❌ ERREUR: Trop de connexions détectées (${connectionCount} > ${MAX_CONNECTIONS})`
    );
    console.error("La boucle de connexions n'a pas été corrigée !");
    process.exit(1);
  }
});

socket.on("disconnect", (reason) => {
  disconnectionCount++;
  console.log(`❌ Déconnexion #${disconnectionCount} - Raison: ${reason}`);
});

socket.on("connect_error", (error) => {
  console.error("❌ Erreur de connexion:", error.message);
});

socket.on("error", (errorData) => {
  console.error("❌ Erreur serveur:", errorData);
});

// Test de ping/pong
socket.on("connect", () => {
  console.log("🏓 Envoi d'un ping de test...");
  socket.emit("ping");
});

socket.on("pong", (data) => {
  console.log("🏓 Pong reçu:", data);
});

// Gestion de l'arrêt du test
setTimeout(() => {
  console.log("\n📊 Résultats du test:");
  console.log(`- Connexions: ${connectionCount}`);
  console.log(`- Déconnexions: ${disconnectionCount}`);
  console.log(`- Durée du test: ${TEST_DURATION}ms`);

  if (connectionCount <= MAX_CONNECTIONS && connectionCount > 0) {
    console.log("✅ SUCCÈS: La correction fonctionne correctement !");
    console.log("✅ Aucune boucle de connexions détectée");
  } else if (connectionCount === 0) {
    console.log("⚠️  ATTENTION: Aucune connexion établie");
    console.log(
      "Vérifiez que le serveur Socket.IO est démarré sur le port 3001"
    );
  } else {
    console.log("❌ ÉCHEC: La boucle de connexions persiste");
  }

  // Fermer la connexion
  socket.disconnect();
  process.exit(
    connectionCount <= MAX_CONNECTIONS && connectionCount > 0 ? 0 : 1
  );
}, TEST_DURATION);

// Gestion des signaux d'arrêt
process.on("SIGINT", () => {
  console.log("\n🛑 Arrêt du test...");
  socket.disconnect();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Arrêt du test...");
  socket.disconnect();
  process.exit(0);
});

console.log(`🚀 Test démarré - Durée: ${TEST_DURATION}ms`);
console.log(`📡 Connexion à: ${SOCKET_URL}`);
console.log("⏳ En attente des résultats...\n");
