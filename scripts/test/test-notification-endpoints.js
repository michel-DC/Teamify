/**
 * Script de test pour les endpoints de l'API des notifications
 * Ce script teste les endpoints HTTP de l'API des notifications
 */

const jwt = require("jsonwebtoken");

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const BASE_URL = "http://localhost:3000";

/**
 * Génère un token JWT de test
 */
function generateTestToken(userUid) {
  return jwt.sign({ userUid }, JWT_SECRET, { expiresIn: "1h" });
}

/**
 * Teste un endpoint de l'API
 */
async function testEndpoint(url, method = "GET", body = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Cookie"] = `token=${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function testNotificationEndpoints() {
  console.log("🧪 Test des endpoints de l'API des notifications...\n");

  try {
    // 1. Générer un token de test
    const testUserUid = "cmf5rz1uh000013gygfqt45yf"; // UID de l'utilisateur de test
    const testToken = generateTestToken(testUserUid);

    console.log(`✅ Token de test généré pour l'utilisateur: ${testUserUid}`);
    console.log(`🔑 Token: ${testToken.substring(0, 50)}...`);

    // 2. Tester l'endpoint GET /api/notifications
    console.log("\n📋 Test de GET /api/notifications...");
    const notificationsResponse = await testEndpoint(
      `${BASE_URL}/api/notifications?includeUnreadCount=true`,
      "GET",
      null,
      testToken
    );

    if (notificationsResponse.ok) {
      console.log(`✅ GET /api/notifications: ${notificationsResponse.status}`);
      console.log(
        `   Notifications: ${
          notificationsResponse.data.notifications?.length || 0
        }`
      );
      console.log(
        `   Non lues: ${notificationsResponse.data.unreadCount || 0}`
      );
    } else {
      console.log(`❌ GET /api/notifications: ${notificationsResponse.status}`);
      console.log(
        `   Erreur: ${
          notificationsResponse.data?.error || notificationsResponse.error
        }`
      );
    }

    // 3. Tester l'endpoint GET /api/notifications/count
    console.log("\n📊 Test de GET /api/notifications/count...");
    const countResponse = await testEndpoint(
      `${BASE_URL}/api/notifications/count`,
      "GET",
      null,
      testToken
    );

    if (countResponse.ok) {
      console.log(`✅ GET /api/notifications/count: ${countResponse.status}`);
      console.log(`   Compteur: ${countResponse.data.unreadCount || 0}`);
    } else {
      console.log(`❌ GET /api/notifications/count: ${countResponse.status}`);
      console.log(
        `   Erreur: ${countResponse.data?.error || countResponse.error}`
      );
    }

    // 4. Tester l'endpoint PUT /api/notifications/all
    console.log("\n✅ Test de PUT /api/notifications/all...");
    const markAllReadResponse = await testEndpoint(
      `${BASE_URL}/api/notifications/all`,
      "PUT",
      null,
      testToken
    );

    if (markAllReadResponse.ok) {
      console.log(
        `✅ PUT /api/notifications/all: ${markAllReadResponse.status}`
      );
      console.log(`   Message: ${markAllReadResponse.data.message}`);
      console.log(`   Compteur: ${markAllReadResponse.data.count || 0}`);
    } else {
      console.log(
        `❌ PUT /api/notifications/all: ${markAllReadResponse.status}`
      );
      console.log(
        `   Erreur: ${
          markAllReadResponse.data?.error || markAllReadResponse.error
        }`
      );
    }

    console.log("\n🎉 Test des endpoints terminé !");
    console.log(
      "\n📝 Note: Assurez-vous que le serveur Next.js est démarré (npm run dev)"
    );
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
}

// Vérifier si fetch est disponible (Node.js 18+)
if (typeof fetch === "undefined") {
  console.log(
    "❌ Ce script nécessite Node.js 18+ ou l'installation de node-fetch"
  );
  console.log("   Installez node-fetch: npm install node-fetch");
  process.exit(1);
}

// Exécuter le test
testNotificationEndpoints();
