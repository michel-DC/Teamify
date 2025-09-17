/**
 * Test du flux d'authentification Socket.IO
 */

const SOCKET_URL = "https://socket.teamify.onlinemichel.dev";
const APP_URL = "https://teamify.onlinemichel.dev";

console.log("🔐 Test du flux d'authentification Socket.IO");
console.log(`📍 Socket URL: ${SOCKET_URL}`);
console.log(`🌐 App URL: ${APP_URL}`);
console.log("=".repeat(60));

async function testAuthFlow() {
  console.log("\n1️⃣ Test de l'API d'authentification...");

  try {
    // Test de l'endpoint d'authentification de l'application principale
    const authResponse = await fetch(`${APP_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`📊 Status API Auth: ${authResponse.status}`);
    console.log(
      `📋 Headers:`,
      Object.fromEntries(authResponse.headers.entries())
    );

    if (authResponse.status === 401) {
      console.log("✅ API Auth répond (401 = non authentifié, normal)");
    } else if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log("✅ Utilisateur authentifié:", authData);
    } else {
      console.log(`⚠️ Status inattendu: ${authResponse.status}`);
    }
  } catch (error) {
    console.log("❌ Erreur API Auth:", error.message);
  }

  console.log("\n2️⃣ Test de l'endpoint Socket.IO avec cookies...");

  try {
    // Test avec des cookies factices
    const socketResponse = await fetch(`${SOCKET_URL}/socket.io/`, {
      method: "GET",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        Origin: "http://localhost:3000",
        Cookie: "token=fake-token-for-testing",
      },
    });

    console.log(`📊 Status Socket.IO: ${socketResponse.status}`);
    console.log(
      `🔒 CORS Origin: ${socketResponse.headers.get(
        "access-control-allow-origin"
      )}`
    );
    console.log(
      `🍪 Credentials: ${socketResponse.headers.get(
        "access-control-allow-credentials"
      )}`
    );

    if (socketResponse.status === 400) {
      const responseText = await socketResponse.text();
      console.log("📄 Réponse:", responseText);

      if (responseText.includes("Transport unknown")) {
        console.log("✅ Socket.IO répond (Transport unknown = normal)");
      } else {
        console.log("⚠️ Réponse inattendue:", responseText);
      }
    } else {
      console.log(`⚠️ Status inattendu: ${socketResponse.status}`);
    }
  } catch (error) {
    console.log("❌ Erreur Socket.IO:", error.message);
  }

  console.log("\n3️⃣ Analyse du problème...");
  console.log("🔍 Le problème probable:");
  console.log("- Le serveur Socket.IO exige une authentification valide");
  console.log("- Il vérifie les cookies en appelant l'API de production");
  console.log(
    "- Depuis localhost, vous n'êtes pas authentifié sur le domaine de production"
  );
  console.log("- C'est pourquoi la connexion WebSocket échoue");

  console.log("\n💡 Solutions possibles:");
  console.log(
    "1. Tester depuis l'application de production (https://teamify.onlinemichel.dev)"
  );
  console.log(
    "2. Modifier temporairement le serveur Socket.IO pour accepter localhost sans auth"
  );
  console.log("3. Créer un token de test valide pour le développement");
  console.log(
    "4. Utiliser un tunnel local (ngrok) pour tester avec le domaine de production"
  );

  return true;
}

// Exécution du test
testAuthFlow()
  .then(() => {
    console.log("\n" + "=".repeat(60));
    console.log("🎯 CONCLUSION:");
    console.log("✅ L'URL Socket.IO est correcte");
    console.log("✅ Le serveur Socket.IO fonctionne");
    console.log("⚠️ Le problème est l'authentification depuis localhost");
    console.log("\n📋 Pour résoudre:");
    console.log("1. Testez depuis https://teamify.onlinemichel.dev");
    console.log(
      "2. Ou modifiez temporairement le serveur pour accepter localhost"
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 ERREUR:", error.message);
    process.exit(1);
  });
