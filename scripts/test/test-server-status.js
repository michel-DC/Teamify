/**
 * Script pour vérifier le statut du serveur
 */

import fetch from "node-fetch";

console.log("🔍 Vérification du statut du serveur...");

async function checkServerStatus() {
  try {
    // Test de l'API Next.js
    console.log("📡 Test de l'API Next.js...");
    const response = await fetch(
      "http://localhost:3000/api/conversations/demo",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      console.log("✅ Serveur Next.js accessible");
      const data = await response.json();
      console.log(
        "📊 Données reçues:",
        data.conversations?.length || 0,
        "conversations"
      );
    } else {
      console.log("❌ Serveur Next.js non accessible:", response.status);
    }
  } catch (error) {
    console.log("❌ Erreur de connexion au serveur Next.js:", error.message);
  }

  try {
    // Test de Socket.IO
    console.log("\n🔌 Test de Socket.IO...");
    const socketResponse = await fetch("http://localhost:3000/socket.io/", {
      method: "GET",
    });

    if (socketResponse.ok) {
      console.log("✅ Socket.IO accessible");
    } else {
      console.log("❌ Socket.IO non accessible:", socketResponse.status);
    }
  } catch (error) {
    console.log("❌ Erreur de connexion à Socket.IO:", error.message);
  }
}

checkServerStatus()
  .then(() => {
    console.log("\n💡 Si les serveurs ne sont pas accessibles, lancez:");
    console.log("   pnpm run dev:full");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur lors de la vérification:", error);
    process.exit(1);
  });
