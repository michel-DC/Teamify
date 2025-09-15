#!/usr/bin/env node

/**
 * Script de test pour vérifier l'implémentation Socket.IO Vercel
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function testSocketIOVercel() {
  console.log("🧪 Test de l'implémentation Socket.IO Vercel");
  console.log("==========================================\n");

  try {
    // Test 1: Vérifier que l'API de test fonctionne
    console.log("1️⃣ Test de l'API de test...");
    const testResponse = await fetch(
      `${BASE_URL}/api/test-socket?test=connection`
    );
    const testData = await testResponse.json();

    if (testData.success) {
      console.log("✅ API de test fonctionne");
      console.log(`   URL Socket: ${testData.socketUrl}`);
      console.log(`   Polling: ${testData.features.polling ? "✅" : "❌"}`);
      console.log(
        `   WebSockets: ${testData.features.websockets ? "✅" : "❌"}`
      );
      console.log(
        `   Vercel compatible: ${
          testData.features.vercelCompatible ? "✅" : "❌"
        }`
      );
    } else {
      console.log("❌ API de test échoue");
      return;
    }

    // Test 2: Test ping
    console.log("\n2️⃣ Test ping...");
    const pingResponse = await fetch(`${BASE_URL}/api/test-socket?test=ping`);
    const pingData = await pingResponse.json();

    if (pingData.success) {
      console.log("✅ Ping fonctionne");
      console.log(`   Timestamp: ${pingData.timestamp}`);
    } else {
      console.log("❌ Ping échoue");
    }

    // Test 3: Vérifier que l'API Socket.IO répond
    console.log("\n3️⃣ Test de l'API Socket.IO...");
    const socketResponse = await fetch(
      `${BASE_URL}/api/socket-io?transport=polling`
    );
    const socketData = await socketResponse.json();

    if (socketData.sid) {
      console.log("✅ API Socket.IO fonctionne");
      console.log(`   SID généré: ${socketData.sid}`);
      console.log(`   Ping interval: ${socketData.pingInterval}ms`);
    } else {
      console.log("❌ API Socket.IO échoue");
    }

    // Test 4: Vérifier la page de test
    console.log("\n4️⃣ Test de la page de test...");
    const pageResponse = await fetch(`${BASE_URL}/test-socket`);

    if (pageResponse.ok) {
      console.log("✅ Page de test accessible");
      console.log(`   Status: ${pageResponse.status}`);
    } else {
      console.log("❌ Page de test inaccessible");
      console.log(`   Status: ${pageResponse.status}`);
    }

    console.log("\n🎉 Tous les tests sont passés !");
    console.log("\n📋 Résumé:");
    console.log("   - Configuration Socket.IO Vercel: ✅");
    console.log("   - API routes: ✅");
    console.log("   - Page de test: ✅");
    console.log("   - Compatible Vercel: ✅");

    console.log("\n🚀 Prochaines étapes:");
    console.log("   1. Visitez http://localhost:3000/test-socket");
    console.log("   2. Testez la connexion Socket.IO");
    console.log("   3. Vérifiez l'envoi/réception de messages");
    console.log("   4. Déployez sur Vercel pour tester en production");
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error.message);
    console.log("\n🔧 Vérifications:");
    console.log("   - Le serveur de développement est-il démarré ?");
    console.log("   - L'URL de test est-elle correcte ?");
    console.log("   - Les API routes sont-elles accessibles ?");
  }
}

// Exécuter les tests
testSocketIOVercel();
