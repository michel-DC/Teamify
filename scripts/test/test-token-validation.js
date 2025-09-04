/**
 * Script de test pour vérifier le système de validation du JWT token
 * Teste la déconnexion automatique lors de l'expiration du token
 */

const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const prisma = new PrismaClient();

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

/**
 * Test de la validation du token avec un token expiré
 */
async function testExpiredTokenValidation() {
  console.log("🧪 Test de validation avec token expiré...");

  try {
    // Créer un token expiré (expiration dans le passé)
    const expiredToken = jwt.sign(
      { userUid: "test-user-uid" },
      JWT_SECRET,
      { expiresIn: "-1h" } // Token expiré il y a 1 heure
    );

    // Tester l'endpoint /api/auth/me avec le token expiré
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `token=${expiredToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📊 Réponse /api/auth/me avec token expiré:", {
      status: response.status,
      ok: response.ok,
    });

    if (response.status === 401) {
      console.log("✅ Token expiré correctement rejeté (401)");
    } else {
      console.log("❌ Token expiré accepté (devrait être 401)");
    }

    const responseData = await response.json();
    console.log("📄 Données de réponse:", responseData);
  } catch (error) {
    console.error("❌ Erreur lors du test de token expiré:", error);
  }
}

/**
 * Test de la validation du token avec un token valide
 */
async function testValidTokenValidation() {
  console.log("🧪 Test de validation avec token valide...");

  try {
    // Créer un token valide
    const validToken = jwt.sign(
      { userUid: "test-user-uid" },
      JWT_SECRET,
      { expiresIn: "1h" } // Token valide pour 1 heure
    );

    // Tester l'endpoint /api/auth/me avec le token valide
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `token=${validToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📊 Réponse /api/auth/me avec token valide:", {
      status: response.status,
      ok: response.ok,
    });

    if (response.status === 401) {
      console.log("⚠️ Token valide rejeté (utilisateur inexistant en base)");
    } else if (response.status === 200) {
      console.log("✅ Token valide accepté");
    } else {
      console.log("❓ Réponse inattendue:", response.status);
    }
  } catch (error) {
    console.error("❌ Erreur lors du test de token valide:", error);
  }
}

/**
 * Test de la déconnexion automatique
 */
async function testAutoLogout() {
  console.log("🧪 Test de déconnexion automatique...");

  try {
    // Tester l'endpoint de déconnexion
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📊 Réponse /api/auth/logout:", {
      status: response.status,
      ok: response.ok,
    });

    if (response.ok) {
      console.log("✅ Déconnexion réussie");

      // Vérifier que les cookies sont supprimés
      const cookies = response.headers.get("set-cookie");
      console.log("🍪 Cookies de déconnexion:", cookies);
    } else {
      console.log("❌ Échec de la déconnexion");
    }

    const responseData = await response.json();
    console.log("📄 Données de réponse:", responseData);
  } catch (error) {
    console.error("❌ Erreur lors du test de déconnexion:", error);
  }
}

/**
 * Test de la vérification de l'expiration côté client
 */
async function testClientSideValidation() {
  console.log("🧪 Test de validation côté client...");

  try {
    // Simuler un localStorage avec isLoggedIn = true
    const mockLocalStorage = {
      getItem: (key) => {
        if (key === "isLoggedIn") return "true";
        if (key === "hasOrganization") return "true";
        return null;
      },
      removeItem: (key) => {
        console.log(`🗑️ Suppression de localStorage: ${key}`);
      },
    };

    // Simuler la vérification d'authentification
    const checkAuth = async () => {
      try {
        const isLoggedIn = mockLocalStorage.getItem("isLoggedIn") === "true";

        if (!isLoggedIn) {
          return { isAuthenticated: false, user: null };
        }

        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (response.ok) {
          const user = await response.json();
          return { isAuthenticated: true, user: user.user };
        }

        return { isAuthenticated: false, user: null };
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        return { isAuthenticated: false, user: null };
      }
    };

    const authResult = await checkAuth();
    console.log("📊 Résultat de la vérification côté client:", authResult);

    if (!authResult.isAuthenticated) {
      console.log("✅ Déconnexion automatique déclenchée");
      mockLocalStorage.removeItem("isLoggedIn");
      mockLocalStorage.removeItem("hasOrganization");
    }
  } catch (error) {
    console.error("❌ Erreur lors du test côté client:", error);
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  console.log("🚀 Démarrage des tests de validation du token JWT\n");

  try {
    await testExpiredTokenValidation();
    console.log("");

    await testValidTokenValidation();
    console.log("");

    await testAutoLogout();
    console.log("");

    await testClientSideValidation();
    console.log("");

    console.log("✅ Tous les tests terminés");
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution des tests:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests();
}

module.exports = {
  testExpiredTokenValidation,
  testValidTokenValidation,
  testAutoLogout,
  testClientSideValidation,
  runTests,
};
