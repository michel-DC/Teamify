/**
 * Script de test pour l'API conversations
 */

import fetch from "node-fetch";

const API_URL = "http://localhost:3000/api/conversations";

console.log("🧪 Test de l'API conversations...");
console.log(`📍 URL: ${API_URL}`);

async function testConversationsAPI() {
  try {
    console.log("\n📡 Test GET /api/conversations...");

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Note: Pas de cookies d'auth pour ce test
      },
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Réponse réussie:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log("❌ Erreur:");
      console.log(errorData);
    }
  } catch (error) {
    console.error("💥 Erreur de connexion:", error.message);
  }
}

async function testCreateConversation() {
  try {
    console.log("\n📡 Test POST /api/conversations...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "GROUP",
        title: "Test Conversation",
        memberIds: [],
      }),
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Conversation créée:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log("❌ Erreur:");
      console.log(errorData);
    }
  } catch (error) {
    console.error("💥 Erreur de connexion:", error.message);
  }
}

// Exécuter les tests
testConversationsAPI()
  .then(() => testCreateConversation())
  .then(() => {
    console.log("\n✅ Tests terminés");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
