/**
 * Script pour tester la récupération du token JWT depuis les cookies
 */

import fetch from "node-fetch";

console.log("🍪 Test de récupération du token JWT...");

async function testTokenRetrieval() {
  try {
    // Test de l'API d'authentification
    const response = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Utilisateur authentifié:", data.user?.email);

      // Vérifier les cookies dans la réponse
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        console.log("🍪 Cookies définis:", setCookieHeader);
      } else {
        console.log("⚠️  Aucun cookie défini dans la réponse");
      }

      return true;
    } else {
      console.log("❌ Non authentifié:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur:", error.message);
    return false;
  }
}

async function testSocketWithToken() {
  console.log("\n🔌 Test de connexion Socket.IO avec token...");

  try {
    const { io } = await import("socket.io-client");

    // Essayer avec le token de démo d'abord
    const socket = io("http://localhost:3001", {
      auth: { token: "demo_token" },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: false,
    });

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log("❌ Timeout de connexion Socket.IO");
        socket.disconnect();
        resolve(false);
      }, 5000);

      socket.on("connect", () => {
        console.log("✅ Socket.IO connecté avec token de démo");
        clearTimeout(timeout);
        socket.disconnect();
        resolve(true);
      });

      socket.on("connect_error", (error) => {
        console.log("❌ Erreur de connexion Socket.IO:", error.message);
        clearTimeout(timeout);
        resolve(false);
      });
    });
  } catch (error) {
    console.log("❌ Erreur d'import Socket.IO:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Test de l'authentification et des tokens...\n");

  const authSuccess = await testTokenRetrieval();
  const socketSuccess = await testSocketWithToken();

  console.log("\n📊 Résultats:");
  console.log(`Authentification: ${authSuccess ? "✅" : "❌"}`);
  console.log(`Socket.IO: ${socketSuccess ? "✅" : "❌"}`);

  if (authSuccess && socketSuccess) {
    console.log("\n🎉 Tout fonctionne !");
    console.log("💡 Le problème d'envoi de messages devrait être résolu");
  } else {
    console.log("\n⚠️  Problèmes détectés");
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
