/**
 * Script de test pour vérifier l'authentification par email/mot de passe
 * Teste la route /api/auth/me après connexion
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function testAuthFlow() {
  console.log("🧪 Test de l'authentification par email/mot de passe...\n");

  try {
    // Étape 1: Connexion
    console.log("1️⃣ Tentative de connexion...");
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "michel@gmail.com",
        password: "michel123",
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error("❌ Échec de la connexion:", errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log("✅ Connexion réussie:", {
      message: loginData.message,
      user: loginData.user?.email,
      hasOrganization: loginData.hasOrganization,
    });

    // Récupérer les cookies de la réponse
    const setCookieHeader = loginResponse.headers.get("set-cookie");
    console.log("🍪 Cookies reçus:", setCookieHeader ? "Oui" : "Non");

    // Étape 2: Vérification de l'authentification
    console.log("\n2️⃣ Vérification de l'authentification...");

    // Attendre un peu pour que les cookies soient synchronisés
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const authResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: setCookieHeader || "",
      },
    });

    console.log(
      "📊 Statut de la vérification:",
      authResponse.status,
      authResponse.statusText
    );

    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log("✅ Authentification vérifiée:", {
        uid: authData.user?.uid,
        email: authData.user?.email,
        firstname: authData.user?.firstname,
      });
    } else {
      const errorData = await authResponse.json();
      console.error("❌ Échec de la vérification:", errorData);
    }

    // Étape 3: Test de la route dashboard
    console.log("\n3️⃣ Test de l'accès au dashboard...");

    const dashboardResponse = await fetch(`${BASE_URL}/api/dashboard`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: setCookieHeader || "",
      },
    });

    console.log(
      "📊 Statut du dashboard:",
      dashboardResponse.status,
      dashboardResponse.statusText
    );

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log("✅ Accès au dashboard réussi:", {
        userCount: Array.isArray(dashboardData) ? dashboardData.length : "N/A",
      });
    } else {
      const errorData = await dashboardResponse.json();
      console.error("❌ Échec de l'accès au dashboard:", errorData);
    }
  } catch (error) {
    console.error("💥 Erreur lors du test:", error);
  }
}

// Instructions d'utilisation
console.log("📋 Instructions:");
console.log("1. Assurez-vous que l'application est démarrée sur", BASE_URL);
console.log("2. Modifiez les identifiants de test dans le script");
console.log("3. Exécutez: node scripts/test/test-auth-fix.js\n");

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testAuthFlow();
}

module.exports = { testAuthFlow };
