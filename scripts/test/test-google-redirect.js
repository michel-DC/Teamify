/**
 * Script pour tester l'URL de redirection Google
 * Exécutez avec: node scripts/test-google-redirect.js
 */

const http = require("http");

console.log("🔍 Test de l'URL de redirection Google\n");

// URL à tester
const testUrl =
  "http://localhost:3000/api/auth/signin/google?callbackUrl=%2Fdashboard";

console.log(`📋 Test de l'URL: ${testUrl}\n`);

// Fonction pour faire une requête HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

// Test de l'URL
async function testRedirect() {
  try {
    console.log("🔧 Test en cours...");

    const response = await makeRequest(testUrl);

    console.log("📊 Résultats:");
    console.log(`   Status Code: ${response.statusCode}`);
    console.log(`   Location Header: ${response.headers.location || "Aucun"}`);

    if (response.statusCode === 302) {
      console.log("✅ Redirection détectée (302)");
      if (response.headers.location) {
        console.log(`   URL de redirection: ${response.headers.location}`);

        if (response.headers.location.includes("accounts.google.com")) {
          console.log("✅ Redirection vers Google OAuth détectée !");
        } else if (response.headers.location.includes("error=google")) {
          console.log("❌ Erreur Google détectée");
          console.log("   Cela signifie que Google rejette la requête");
          console.log("   Vérifiez votre configuration Google Cloud Console");
        } else {
          console.log("⚠️  Redirection inattendue");
        }
      }
    } else {
      console.log(`⚠️  Status code inattendu: ${response.statusCode}`);
    }

    // Afficher les premiers caractères de la réponse
    if (response.data && response.data.length > 0) {
      console.log(
        `   Début de la réponse: ${response.data.substring(0, 300)}...`
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
  }
}

// Exécuter le test
testRedirect()
  .then(() => {
    console.log("\n✅ Test terminé !");
  })
  .catch((error) => {
    console.error("\n❌ Test échoué:", error.message);
  });
