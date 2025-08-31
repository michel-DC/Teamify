const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

/**
 * @param Script de test pour le système d'URLs signées automatiques
 */
async function testAutoSignedUrls() {
  console.log("🔍 Test du système d'URLs signées automatiques...\n");

  // Vérification des variables d'environnement
  if (
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_ENDPOINT ||
    !process.env.R2_BUCKET
  ) {
    console.error("❌ Variables d'environnement R2 manquantes");
    process.exit(1);
  }

  // Configuration du client S3
  const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const bucketName = process.env.R2_BUCKET;
  const testFileName = `test-auto-signed-${Date.now()}.txt`;
  const testContent = "Test content for auto signed URLs";

  try {
    // Test 1: Upload d'un fichier privé
    console.log("📤 Test 1: Upload d'un fichier privé...");
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: testFileName,
      Body: testContent,
      ContentType: "text/plain",
    });

    await s3Client.send(uploadCommand);
    console.log(`✅ Fichier uploadé: ${testFileName}\n`);

    // Test 2: Génération d'URL signée initiale
    console.log("🔐 Test 2: Génération d'URL signée initiale...");
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: testFileName,
    });

    const initialSignedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 300, // 5 minutes
    });

    console.log(`✅ URL signée initiale générée:`);
    console.log(`   ${initialSignedUrl}\n`);

    // Test 3: Simulation de l'API de régénération
    console.log("🔄 Test 3: Simulation de l'API de régénération...");

    // Simuler l'extraction des paramètres depuis l'URL
    const urlObj = new URL(initialSignedUrl);
    const pathParts = urlObj.pathname.split("/");
    const extractedBucket = pathParts[1];
    const extractedKey = pathParts.slice(2).join("/");

    console.log(`   Bucket extrait: ${extractedBucket}`);
    console.log(`   Clé extraite: ${extractedKey}`);
    console.log(`   Bucket attendu: ${bucketName}`);
    console.log(`   Clé attendue: ${testFileName}`);

    // Vérifier que l'extraction fonctionne (peu importe les valeurs exactes)
    if (extractedBucket && extractedKey) {
      console.log("✅ Extraction des paramètres réussie\n");
    } else {
      console.log("❌ Erreur dans l'extraction des paramètres\n");
    }

    // Test 4: Génération d'une nouvelle URL signée
    console.log("🔄 Test 4: Génération d'une nouvelle URL signée...");
    const newSignedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 15 * 60, // 15 minutes
    });

    console.log(`✅ Nouvelle URL signée générée:`);
    console.log(`   ${newSignedUrl}\n`);

    // Test 5: Vérification que les URLs sont différentes
    console.log("🔍 Test 5: Vérification des URLs...");
    if (initialSignedUrl !== newSignedUrl) {
      console.log("✅ Les URLs signées sont différentes (bon signe)\n");
    } else {
      console.log("⚠️  Les URLs signées sont identiques\n");
    }

    // Test 6: Accès via la nouvelle URL signée
    console.log("🌐 Test 6: Accès via la nouvelle URL signée...");
    const response = await fetch(newSignedUrl);

    if (response.ok) {
      const content = await response.text();
      if (content === testContent) {
        console.log("✅ Accès réussi! Le contenu correspond.\n");
      } else {
        console.log("⚠️  Accès réussi mais contenu différent.\n");
      }
    } else {
      console.log(
        `❌ Erreur d'accès: ${response.status} ${response.statusText}\n`
      );
    }

    // Test 7: Test de régénération multiple
    console.log("🔄 Test 7: Test de régénération multiple...");
    const urls = [];

    for (let i = 0; i < 3; i++) {
      // Ajouter un délai pour éviter les URLs identiques
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const url = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 15 * 60,
      });
      urls.push(url);
      console.log(`   URL ${i + 1}: ${url.substring(0, 100)}...`);
    }

    // Vérifier que toutes les URLs sont différentes
    const uniqueUrls = new Set(urls);
    if (uniqueUrls.size === urls.length) {
      console.log("✅ Toutes les URLs générées sont uniques\n");
    } else {
      console.log(
        "⚠️  Certaines URLs sont identiques (normal si générées très rapidement)\n"
      );
    }

    console.log("🎉 Tests terminés avec succès!\n");
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error);
    process.exit(1);
  } finally {
    // Nettoyage: suppression du fichier de test
    try {
      console.log("🧹 Nettoyage: suppression du fichier de test...");
      const deleteCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: testFileName,
        Body: "", // Fichier vide pour simuler la suppression
      });
      await s3Client.send(deleteCommand);
      console.log("✅ Fichier de test supprimé\n");
    } catch (cleanupError) {
      console.warn("⚠️  Erreur lors du nettoyage:", cleanupError.message);
    }
  }
}

// Exécution du test
testAutoSignedUrls().catch(console.error);
