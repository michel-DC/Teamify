/**
 * Script de test pour vérifier l'authentification par cookies
 */

const API_URL = "http://localhost:3000";

async function testCookieAuth() {
  console.log("🧪 Test de l'authentification par cookies");
  console.log("=".repeat(50));

  try {
    // 1. Tester l'API d'authentification
    console.log("1️⃣ Test de l'API /api/auth/me...");

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include", // Inclure les cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Réponse API:", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Utilisateur authentifié:", {
        uid: data.user.uid,
        email: data.user.email,
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
            content: "Test de message avec authentification par cookies",
          }),
        }
      );

      if (messageResponse.ok) {
        const messageData = await messageResponse.json();
        console.log("✅ Message envoyé avec succès:", {
          id: messageData.id,
          content: messageData.content,
        });
      } else {
        const errorData = await messageResponse.json();
        console.error("❌ Erreur lors de l'envoi du message:", errorData);
      }
    } else {
      console.log("❌ Utilisateur non authentifié");
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Exécuter le test
testCookieAuth()
  .then(() => {
    console.log("\n🎉 Test terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
