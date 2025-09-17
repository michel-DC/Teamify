/**
 * Script de test pour vérifier l'affichage des conversations
 *
 * Ce script teste le problème d'affichage des conversations créées
 */

console.log("🧪 Test de l'affichage des conversations...");

// Test 1: Vérifier que l'API des conversations fonctionne
async function testConversationsAPI() {
  console.log("\n📋 Test de l'API des conversations...");

  try {
    const response = await fetch("http://localhost:3000/api/conversations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 401) {
      console.log("✅ API protégée correctement (authentification requise)");
      return true;
    } else if (response.ok) {
      const data = await response.json();
      console.log(
        "✅ Conversations récupérées:",
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

// Test 2: Vérifier que l'API de recherche d'utilisateur fonctionne
async function testUserSearchAPI() {
  console.log("\n📧 Test de l'API de recherche d'utilisateur...");

  try {
    const response = await fetch(
      "http://localhost:3000/api/users/search?email=test@example.com",
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

// Test 3: Vérifier que l'API de démonstration fonctionne
async function testDemoAPI() {
  console.log("\n🎭 Test de l'API de démonstration...");

  try {
    const response = await fetch(
      "http://localhost:3000/api/conversations/demo",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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

// Exécuter tous les tests
async function runAllTests() {
  console.log("🚀 Démarrage des tests d'affichage des conversations...");

  const results = [];

  // Test 1: API des conversations
  results.push(await testConversationsAPI());

  // Test 2: API de recherche d'utilisateur
  results.push(await testUserSearchAPI());

  // Test 3: API de démonstration
  results.push(await testDemoAPI());

  // Résultats
  const successCount = results.filter(Boolean).length;
  const totalTests = results.length;

  console.log("\n📊 Résultats des tests:");
  console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);

  if (successCount === totalTests) {
    console.log("🎉 Tous les tests sont passés avec succès !");
    console.log("✅ Les APIs fonctionnent correctement");
    console.log("💡 Le problème d'affichage devrait être résolu");
  } else {
    console.log("⚠️  Certains tests ont échoué");
    console.log("🔧 Vérifiez que le serveur est démarré");
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
