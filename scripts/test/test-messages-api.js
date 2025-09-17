/**
 * Script de test pour l'API des messages
 */

import fetch from "node-fetch";

console.log("📨 Test de l'API des messages...");

async function testMessagesAPI() {
  try {
    // D'abord, récupérer une conversation de démo
    console.log("1. Récupération d'une conversation de démo...");
    const conversationsResponse = await fetch(
      "http://localhost:3000/api/conversations/demo",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!conversationsResponse.ok) {
      console.log("❌ Impossible de récupérer les conversations");
      return false;
    }

    const conversationsData = await conversationsResponse.json();
    const conversationId = conversationsData.conversations?.[0]?.id;

    if (!conversationId) {
      console.log("❌ Aucune conversation trouvée");
      return false;
    }

    console.log("✅ Conversation trouvée:", conversationId);

    // Ensuite, récupérer les messages de cette conversation
    console.log("2. Récupération des messages...");
    const messagesResponse = await fetch(
      `http://localhost:3000/api/conversations/${conversationId}/messages`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Status: ${messagesResponse.status}`);

    if (messagesResponse.ok) {
      const messagesData = await messagesResponse.json();
      console.log(
        "✅ Messages récupérés:",
        messagesData.messages?.length || 0,
        "messages"
      );

      if (messagesData.messages?.length > 0) {
        console.log("📝 Premier message:", {
          id: messagesData.messages[0].id,
          content: messagesData.messages[0].content,
          sender: messagesData.messages[0].sender,
        });
      }

      return true;
    } else {
      const errorData = await messagesResponse.json();
      console.log("❌ Erreur API des messages:", errorData);
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur de connexion:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Test de l'API des messages...\n");

  const success = await testMessagesAPI();

  if (success) {
    console.log("\n🎉 Test réussi !");
    console.log("✅ L'API des messages fonctionne correctement");
    console.log(
      "💡 Les messages devraient maintenant s'afficher dans l'interface"
    );
  } else {
    console.log("\n⚠️  Test échoué");
    console.log("🔧 Solutions possibles:");
    console.log("   1. Lancez le serveur: pnpm run dev:full");
    console.log("   2. Vérifiez que l'utilisateur est connecté");
    console.log("   3. Vérifiez les logs du serveur");
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
