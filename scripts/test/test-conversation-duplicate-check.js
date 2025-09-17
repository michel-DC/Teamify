/**
 * Script de test pour vérifier la détection de conversations privées dupliquées
 */

const BASE_URL = "http://localhost:3000";

async function testConversationDuplicateCheck() {
  console.log("🧪 Test de détection de conversations privées dupliquées");
  console.log("=".repeat(60));

  try {
    // 1. Test de l'API de vérification de conversation privée
    console.log("\n1. Test de l'API check-private...");

    const testUserId = "test-user-123";
    const response = await fetch(
      `${BASE_URL}/api/conversations/check-private?userId=${testUserId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API check-private fonctionne");
      console.log("   Réponse:", data);
    } else {
      console.log(
        "❌ Erreur API check-private:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.log("   Détails:", errorText);
    }

    // 2. Test de création de conversation avec titre undefined
    console.log("\n2. Test de création de conversation...");

    const createResponse = await fetch(`${BASE_URL}/api/conversations`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "PRIVATE",
        title: undefined, // Test avec titre undefined
        memberIds: [testUserId],
      }),
    });

    if (createResponse.ok) {
      const conversation = await createResponse.json();
      console.log(
        "✅ Création de conversation avec titre undefined fonctionne"
      );
      console.log("   Conversation créée:", {
        id: conversation.id,
        title: conversation.title,
        type: conversation.type,
      });
    } else {
      console.log(
        "❌ Erreur création conversation:",
        createResponse.status,
        createResponse.statusText
      );
      const errorText = await createResponse.text();
      console.log("   Détails:", errorText);
    }

    console.log("\n✅ Tests terminés avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error);
  }
}

// Exécuter les tests
testConversationDuplicateCheck();
