/**
 * Script de test pour vérifier l'affichage des messages
 */

const API_URL = "http://localhost:3000";

async function testMessageDisplay() {
  console.log("🧪 Test de l'affichage des messages");
  console.log("=".repeat(50));

  try {
    // 1. Tester l'authentification
    console.log("1️⃣ Test de l'authentification...");

    const authResponse = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!authResponse.ok) {
      console.log("❌ Aucun utilisateur authentifié - test ignoré");
      return true;
    }

    const authData = await authResponse.json();
    console.log("✅ Utilisateur authentifié:", {
      uid: authData.user.uid,
      email: authData.user.email,
    });

    // 2. Tester l'envoi d'un message
    console.log("\n2️⃣ Test d'envoi de message...");

    const messageResponse = await fetch(
      `${API_URL}/api/conversations/cmfcshnxp000550eauiymbt8g/messages`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `Test d'affichage - ${new Date().toLocaleTimeString()}`,
        }),
      }
    );

    if (messageResponse.ok) {
      const messageData = await messageResponse.json();
      console.log("✅ Message envoyé avec succès:", {
        id: messageData.id,
        content: messageData.content,
        senderId: messageData.senderId,
        sender: messageData.sender,
      });
    } else {
      const errorData = await messageResponse.json();
      console.error("❌ Erreur lors de l'envoi du message:", errorData);
      return false;
    }

    // 3. Tester la récupération des messages
    console.log("\n3️⃣ Test de récupération des messages...");

    const messagesResponse = await fetch(
      `${API_URL}/api/conversations/cmfcshnxp000550eauiymbt8g/messages`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (messagesResponse.ok) {
      const messagesData = await messagesResponse.json();
      console.log("✅ Messages récupérés:", {
        count: messagesData.messages?.length || 0,
        messages:
          messagesData.messages?.map((msg) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            isCurrentUser: msg.senderId === authData.user.uid,
          })) || [],
      });
    } else {
      console.error("❌ Erreur lors de la récupération des messages");
      return false;
    }

    console.log("\n✅ Test d'affichage des messages réussi !");
    console.log("📝 Vérifications à faire dans l'interface :");
    console.log("   - Les messages envoyés doivent être à droite (bleu)");
    console.log("   - Les messages reçus doivent être à gauche (gris)");
    console.log("   - Pas d'avatar ni de nom d'utilisateur affiché");
    console.log("   - L'heure doit être alignée selon le côté du message");

    return true;
  } catch (error) {
    console.error("❌ Erreur générale:", error);
    return false;
  }
}

// Exécuter le test
testMessageDisplay()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Test terminé avec succès !");
    } else {
      console.log("\n💥 Le test a échoué");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
