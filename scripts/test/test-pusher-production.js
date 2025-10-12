/**
 * Script de test pour vérifier la configuration Pusher en production
 * Usage: node scripts/test/test-pusher-production.js
 */

import https from "https";
import http from "http";

// Configuration
const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://your-app.vercel.app";
const API_ENDPOINTS = {
  pusherTest: "/api/pusher-test",
  triggerEvent: "/api/trigger-event",
  sendMessage: "/api/messages/send",
};

/**
 * Faire une requête HTTP/HTTPS
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https");
    const client = isHttps ? https : http;

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Pusher-Test-Script/1.0",
      },
      ...options,
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Tester la configuration Pusher
 */
async function testPusherConfiguration() {
  console.log("🔍 Test de la configuration Pusher en production...\n");

  try {
    const url = `${PRODUCTION_URL}${API_ENDPOINTS.pusherTest}`;
    console.log(`📡 Test de l'endpoint: ${url}`);

    const response = await makeRequest(url);

    console.log(`📊 Status: ${response.status}`);

    if (response.status === 200) {
      const data = response.data;
      console.log("\n✅ Configuration Pusher:");
      console.log(`   Environment: ${data.data.environment.NODE_ENV}`);
      console.log(`   Timestamp: ${data.data.environment.timestamp}`);

      console.log("\n📋 Variables d'environnement:");
      Object.entries(data.data.variables).forEach(([key, exists]) => {
        console.log(`   ${key}: ${exists ? "✅" : "❌"}`);
      });

      if (data.data.missingVariables.length > 0) {
        console.log("\n❌ Variables manquantes:");
        data.data.missingVariables.forEach((variable) => {
          console.log(`   - ${variable}`);
        });
      } else {
        console.log("\n✅ Toutes les variables d'environnement sont présentes");
      }

      console.log("\n🔌 Test de connexion Pusher:");
      if (data.data.pusherTest.success) {
        console.log(`   ✅ ${data.data.pusherTest.message}`);
      } else {
        console.log(`   ❌ ${data.data.pusherTest.message}`);
        if (data.data.pusherTest.error) {
          console.log(`   Erreur: ${data.data.pusherTest.error}`);
        }
      }

      console.log("\n💡 Recommandations:");
      data.data.recommendations.forEach((rec) => {
        console.log(`   - ${rec}`);
      });
    } else {
      console.log(`❌ Erreur HTTP: ${response.status}`);
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
  }
}

/**
 * Tester l'envoi d'événement
 */
async function testEventTrigger() {
  console.log("\n📤 Test d'envoi d'événement...\n");

  try {
    const url = `${PRODUCTION_URL}${API_ENDPOINTS.triggerEvent}`;
    console.log(`📡 Envoi vers: ${url}`);

    const testData = {
      channel: "test-channel",
      event: "test-event",
      data: {
        message: "Test depuis le script de production",
        timestamp: new Date().toISOString(),
      },
    };

    const response = await makeRequest(url, {
      method: "POST",
      body: testData,
    });

    console.log(`📊 Status: ${response.status}`);

    if (response.status === 200) {
      console.log("✅ Événement envoyé avec succès");
      console.log("Response:", response.data);
    } else {
      console.log("❌ Erreur lors de l'envoi de l'événement");
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.error("❌ Erreur lors du test d'envoi:", error.message);
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log("🚀 Test de configuration Pusher en production\n");
  console.log(`🌐 URL de production: ${PRODUCTION_URL}\n`);
  console.log(
    `📡 Endpoint test: ${PRODUCTION_URL}${API_ENDPOINTS.pusherTest}\n`
  );

  await testPusherConfiguration();
  await testEventTrigger();

  console.log("\n✨ Test terminé");
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testPusherConfiguration, testEventTrigger, makeRequest };
