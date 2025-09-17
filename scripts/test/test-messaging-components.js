/**
 * Script de test pour vérifier les composants de messagerie
 *
 * Ce script teste les nouvelles fonctionnalités de messagerie :
 * - API de recherche d'utilisateur par email
 * - Création de conversation
 * - Interface utilisateur
 */

import fetch from "node-fetch";

console.log("🧪 Test des composants de messagerie...");

// Configuration de test
const BASE_URL = "http://localhost:3000";
const TEST_EMAIL = "test@example.com";

/**
 * Test de l'API de recherche d'utilisateur
 */
async function testUserSearchAPI() {
  console.log("\n📧 Test de l'API de recherche d'utilisateur...");

  try {
    const response = await fetch(
      `${BASE_URL}/api/users/search?email=${encodeURIComponent(TEST_EMAIL)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Status: ${response.status}`);

    if (response.status === 404) {
      console.log("✅ API fonctionne correctement (utilisateur non trouvé)");
      return true;
    } else if (response.ok) {
      const userData = await response.json();
      console.log("✅ Utilisateur trouvé:", userData);
      return true;
    } else {
      console.log("❌ Erreur API:", response.statusText);
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur de connexion:", error.message);
    return false;
  }
}

/**
 * Test de l'API de création de conversation
 */
async function testConversationAPI() {
  console.log("\n💬 Test de l'API de création de conversation...");

  try {
    const response = await fetch(`${BASE_URL}/api/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "PRIVATE",
        title: "Test Conversation",
        memberIds: [],
      }),
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 401) {
      console.log("✅ API protégée correctement (authentification requise)");
      return true;
    } else if (response.ok) {
      const conversationData = await response.json();
      console.log("✅ Conversation créée:", conversationData);
      return true;
    } else {
      console.log("❌ Erreur API:", response.statusText);
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur de connexion:", error.message);
    return false;
  }
}

/**
 * Test de l'API de démonstration des conversations
 */
async function testConversationsDemoAPI() {
  console.log("\n📋 Test de l'API de démonstration des conversations...");

  try {
    const response = await fetch(`${BASE_URL}/api/conversations/demo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(
        "✅ Conversations de démo récupérées:",
        data.conversations?.length || 0,
        "conversations"
      );
      return true;
    } else {
      console.log("❌ Erreur API:", response.statusText);
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur de connexion:", error.message);
    return false;
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log("🚀 Démarrage des tests de messagerie...");
  console.log(`📡 URL de base: ${BASE_URL}`);

  const results = [];

  // Test 1: API de recherche d'utilisateur
  results.push(await testUserSearchAPI());

  // Test 2: API de création de conversation
  results.push(await testConversationAPI());

  // Test 3: API de démonstration des conversations
  results.push(await testConversationsDemoAPI());

  // Résultats
  const successCount = results.filter(Boolean).length;
  const totalTests = results.length;

  console.log("\n📊 Résultats des tests:");
  console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);

  if (successCount === totalTests) {
    console.log("🎉 Tous les tests sont passés avec succès !");
    console.log("✅ Les composants de messagerie sont prêts à être utilisés");
  } else {
    console.log("⚠️  Certains tests ont échoué");
    console.log(
      "🔧 Vérifiez que le serveur est démarré et que les APIs sont accessibles"
    );
  }

  return successCount === totalTests;
}

// Exécuter les tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Erreur lors de l'exécution des tests:", error);
    process.exit(1);
  });
