/**
 * Script pour vérifier si le serveur Socket.IO est démarré
 */

import fetch from "node-fetch";

console.log("🔍 Vérification du serveur Socket.IO...");

async function checkSocketServer() {
  try {
    // Test de l'endpoint Socket.IO
    const socketUrl =
      process.env.SOCKET_URL || "https://socket.teamify.onlinemichel.dev";
    const response = await fetch(`${socketUrl}/socket.io/`, {
      method: "GET",
    });

    if (response.ok) {
      console.log("✅ Serveur Socket.IO accessible !");
      console.log(`🔗 URL: ${socketUrl}`);
      return true;
    } else {
      console.log("❌ Serveur Socket.IO non accessible");
      console.log(`📊 Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur de connexion au serveur Socket.IO");
    console.log(`📊 Erreur: ${error.message}`);
    return false;
  }
}

async function checkNextJSServer() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/conversations/demo",
      {
        method: "GET",
      }
    );

    if (response.ok) {
      console.log("✅ Serveur Next.js accessible !");
      return true;
    } else {
      console.log("❌ Serveur Next.js non accessible");
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur de connexion au serveur Next.js");
    return false;
  }
}

async function main() {
  console.log("🚀 Vérification des serveurs...\n");

  const nextjsRunning = await checkNextJSServer();
  const socketRunning = await checkSocketServer();

  console.log("\n📊 Résultats:");
  console.log(`Next.js: ${nextjsRunning ? "✅" : "❌"}`);
  console.log(`Socket.IO: ${socketRunning ? "✅" : "❌"}`);

  if (!socketRunning) {
    console.log("\n🔧 Solution:");
    console.log("1. Arrêtez le serveur actuel (Ctrl+C)");
    console.log("2. Lancez la commande: pnpm run dev:full");
    console.log("3. Attendez que les deux serveurs soient démarrés");
    console.log("4. Rechargez la page de messagerie");
  } else if (nextjsRunning && socketRunning) {
    console.log("\n🎉 Tous les serveurs sont démarrés !");
    console.log("✅ L'envoi de messages devrait maintenant fonctionner");
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
