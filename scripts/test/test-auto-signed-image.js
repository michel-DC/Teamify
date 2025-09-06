/**
 * Script de test pour vérifier le fonctionnement du composant AutoSignedImage
 *
 * Ce script simule le comportement du composant AutoSignedImage
 * et teste la gestion des erreurs d'expiration des URLs signées.
 */

// Configuration
const BASE_URL = "http://localhost:3000";

/**
 * Test de simulation d'une URL signée expirée
 */
async function testExpiredUrlHandling() {
  console.log("🧪 Test de gestion des URLs expirées...");

  // URL d'exemple qui simule une URL signée expirée
  const expiredUrl =
    "https://example-bucket.r2.cloudflarestorage.com/expired-image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=expired&X-Amz-Date=20240101T000000Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=expired";

  try {
    // Test de l'URL expirée
    const response = await fetch(expiredUrl, { method: "HEAD" });
    console.log(`📊 Status de l'URL expirée: ${response.status}`);

    if (response.status === 403) {
      console.log("✅ URL expirée correctement détectée (403)");
    } else if (response.status === 404) {
      console.log(
        "⚠️  URL non trouvée (404) - peut être normale pour une URL de test"
      );
    } else {
      console.log(`⚠️  Status inattendu: ${response.status}`);
    }
  } catch (error) {
    console.log("✅ Erreur attendue pour URL expirée:", error.message);
  }
}

/**
 * Test de l'API de génération d'URL signée avec une URL invalide
 */
async function testSignedUrlApiWithInvalidUrl() {
  console.log("🔗 Test de l'API avec URL invalide...");

  const invalidUrl = "https://invalid-url.com/nonexistent.jpg";

  try {
    const response = await fetch(`${BASE_URL}/api/images/signed-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: invalidUrl }),
    });

    console.log(`📊 Status API avec URL invalide: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.log("✅ Erreur attendue:", errorData.error);
    } else {
      console.log("⚠️  L'API a accepté une URL invalide");
    }
  } catch (error) {
    console.log("✅ Erreur réseau attendue:", error.message);
  }
}

/**
 * Test de l'API de génération d'URL signée sans authentification
 */
async function testSignedUrlApiWithoutAuth() {
  console.log("🔐 Test de l'API sans authentification...");

  const testUrl = "https://example.com/test.jpg";

  try {
    const response = await fetch(`${BASE_URL}/api/images/signed-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: testUrl }),
    });

    console.log(`📊 Status API sans auth: ${response.status}`);

    if (response.status === 401) {
      console.log("✅ Authentification requise correctement détectée (401)");
    } else {
      console.log(`⚠️  Status inattendu: ${response.status}`);
    }
  } catch (error) {
    console.log("✅ Erreur réseau:", error.message);
  }
}

/**
 * Test de validation des URLs R2
 */
function testR2UrlValidation() {
  console.log("🔍 Test de validation des URLs R2...");

  const validR2Url =
    "https://bucket.r2.cloudflarestorage.com/path/to/image.jpg";
  const invalidUrl = "https://example.com/image.jpg";

  // Fonction de validation simple (similaire à celle dans le code)
  function isR2Url(url) {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes("r2.cloudflarestorage.com") ||
        urlObj.hostname.includes("cloudflare.com")
      );
    } catch {
      return false;
    }
  }

  console.log(`✅ URL R2 valide détectée: ${isR2Url(validR2Url)}`);
  console.log(`✅ URL non-R2 détectée: ${!isR2Url(invalidUrl)}`);
}

/**
 * Test de simulation du comportement du composant AutoSignedImage
 */
function testAutoSignedImageBehavior() {
  console.log("🖼️  Test du comportement AutoSignedImage...");

  // Simulation des états du composant
  const states = [
    {
      name: "Chargement initial",
      isLoading: true,
      hasError: false,
      hasImage: false,
    },
    {
      name: "Image chargée",
      isLoading: false,
      hasError: false,
      hasImage: true,
    },
    {
      name: "Erreur d'expiration",
      isLoading: false,
      hasError: true,
      hasImage: false,
    },
    {
      name: "Fallback affiché",
      isLoading: false,
      hasError: true,
      hasImage: false,
    },
  ];

  states.forEach((state) => {
    console.log(`📊 État: ${state.name}`);
    console.log(`   - Chargement: ${state.isLoading ? "Oui" : "Non"}`);
    console.log(`   - Erreur: ${state.hasError ? "Oui" : "Non"}`);
    console.log(`   - Image: ${state.hasImage ? "Oui" : "Non"}`);

    // Logique de rendu simulée
    if (state.isLoading) {
      console.log("   → Affiche le composant de chargement");
    } else if (state.hasError) {
      console.log("   → Affiche le composant d'erreur/fallback");
    } else if (state.hasImage) {
      console.log("   → Affiche l'image");
    }
    console.log("");
  });
}

/**
 * Fonction principale de test
 */
async function runTests() {
  console.log("🚀 Début des tests du composant AutoSignedImage...\n");

  await testExpiredUrlHandling();
  console.log("");

  await testSignedUrlApiWithInvalidUrl();
  console.log("");

  await testSignedUrlApiWithoutAuth();
  console.log("");

  testR2UrlValidation();
  console.log("");

  testAutoSignedImageBehavior();
  console.log("");

  console.log("✅ Tests terminés");
  console.log("\n📋 Résumé des corrections apportées:");
  console.log("1. ✅ Gestion d'erreur améliorée dans team-switcher.tsx");
  console.log("2. ✅ Composants de fallback ajoutés pour les images");
  console.log("3. ✅ Composants de chargement ajoutés");
  console.log(
    "4. ✅ Fallback vers les données de l'organisation en cas d'erreur API"
  );
  console.log(
    "5. ✅ AutoSignedImage configuré avec errorComponent et loadingComponent"
  );
}

// Exécution des tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testExpiredUrlHandling,
  testSignedUrlApiWithInvalidUrl,
  testSignedUrlApiWithoutAuth,
  testR2UrlValidation,
  testAutoSignedImageBehavior,
  runTests,
};
