/**
 * Script de test pour vérifier le fonctionnement des images dans le team-switcher
 *
 * Ce script teste :
 * 1. La récupération des images de profil des organisations
 * 2. La gestion des erreurs d'expiration des URLs signées
 * 3. Le fonctionnement du composant AutoSignedImage
 */

// Utilisation du fetch natif de Node.js (disponible depuis Node.js 18)
const fetch = globalThis.fetch;

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const TEST_ORGANIZATION_PUBLIC_ID = "cmf5s0soj000113gyge99lat9";

/**
 * Test de récupération de l'image de profil d'une organisation
 */
async function testOrganizationProfileImage() {
  console.log("🧪 Test de récupération de l'image de profil d'organisation...");

  if (!TEST_ORGANIZATION_PUBLIC_ID) {
    console.log("⚠️  TEST_ORG_PUBLIC_ID non défini, test ignoré");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/api/organizations/by-public-id/${TEST_ORGANIZATION_PUBLIC_ID}/profile-image`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`📊 Status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ Erreur: ${errorData.error}`);
      return;
    }

    const data = await response.json();
    console.log("✅ Données récupérées:", {
      hasProfileImage: !!data.profileImage,
      organizationName: data.name,
      profileImageUrl: data.profileImage
        ? data.profileImage.substring(0, 50) + "..."
        : null,
    });

    // Test de l'URL de l'image si elle existe
    if (data.profileImage) {
      await testImageUrl(data.profileImage);
    }
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
  }
}

/**
 * Test de l'URL de l'image pour vérifier si elle est accessible
 */
async function testImageUrl(imageUrl) {
  console.log("🖼️  Test de l'URL de l'image...");

  try {
    const response = await fetch(imageUrl, { method: "HEAD" });
    console.log(`📊 Status de l'image: ${response.status}`);

    if (response.status === 403) {
      console.log(
        "⚠️  Image non accessible (403) - URL signée probablement expirée"
      );
    } else if (response.status === 200) {
      console.log("✅ Image accessible");
    } else {
      console.log(`⚠️  Status inattendu: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors du test de l'URL:", error.message);
  }
}

/**
 * Test de génération d'URL signée
 */
async function testSignedUrlGeneration() {
  console.log("🔗 Test de génération d'URL signée...");

  if (!TEST_ORGANIZATION_PUBLIC_ID) {
    console.log("⚠️  TEST_ORG_PUBLIC_ID non défini, test ignoré");
    return;
  }

  try {
    // D'abord récupérer l'URL de l'image
    const profileResponse = await fetch(
      `${BASE_URL}/api/organizations/by-public-id/${TEST_ORGANIZATION_PUBLIC_ID}/profile-image`
    );

    if (!profileResponse.ok) {
      console.log("❌ Impossible de récupérer l'image de profil");
      return;
    }

    const profileData = await profileResponse.json();

    if (!profileData.profileImage) {
      console.log("⚠️  Aucune image de profil à tester");
      return;
    }

    // Tester la génération d'URL signée
    const signedUrlResponse = await fetch(`${BASE_URL}/api/images/signed-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: profileData.profileImage }),
    });

    console.log(`📊 Status génération URL signée: ${signedUrlResponse.status}`);

    if (!signedUrlResponse.ok) {
      const errorData = await signedUrlResponse.json();
      console.log(`❌ Erreur génération URL: ${errorData.error}`);
      return;
    }

    const signedUrlData = await signedUrlResponse.json();
    console.log("✅ URL signée générée:", {
      success: signedUrlData.success,
      expiresIn: signedUrlData.expiresIn,
      hasSignedUrl: !!signedUrlData.signedUrl,
    });

    // Tester la nouvelle URL signée
    if (signedUrlData.signedUrl) {
      await testImageUrl(signedUrlData.signedUrl);
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors du test de génération d'URL signée:",
      error.message
    );
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  console.log("🚀 Début des tests du team-switcher images...\n");

  await testOrganizationProfileImage();
  console.log("");

  await testSignedUrlGeneration();
  console.log("");

  console.log("✅ Tests terminés");
}

// Exécution des tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testOrganizationProfileImage,
  testImageUrl,
  testSignedUrlGeneration,
  runTests,
};
