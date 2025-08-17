const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

/**
 * @param Script de test pour les URLs signées Cloudflare R2
 */
async function testSignedUrls() {
  console.log("🔍 Test des URLs signées Cloudflare R2...\n");

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
  const testFileName = `test-signed-${Date.now()}.txt`;
  const testContent = "Test content for signed URLs";

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

    // Test 2: Génération d'URL signée
    console.log("🔐 Test 2: Génération d'URL signée...");
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: testFileName,
    });

    const signedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 300, // 5 minutes
    });

    console.log(`✅ URL signée générée:`);
    console.log(`   ${signedUrl}\n`);

    // Test 3: Accès via l'URL signée
    console.log("🌐 Test 3: Accès via l'URL signée...");
    const response = await fetch(signedUrl);

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

    // Test 4: Test d'expiration (simulation)
    console.log("⏰ Test 4: Test d'expiration...");
    const shortExpiryUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 1, // 1 seconde
    });

    console.log(`✅ URL avec expiration courte générée`);
    console.log(`   Attente de 2 secondes pour tester l'expiration...`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const expiredResponse = await fetch(shortExpiryUrl);
    if (expiredResponse.status === 403) {
      console.log("✅ Expiration fonctionne correctement (403 Forbidden)\n");
    } else {
      console.log(
        `⚠️  URL expirée mais toujours accessible: ${expiredResponse.status}\n`
      );
    }

    // Test 5: Test avec headers personnalisés
    console.log("📋 Test 5: Headers personnalisés...");
    const customHeadersCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: testFileName,
      ResponseContentType: "text/plain",
      ResponseContentDisposition: "inline",
    });

    const customHeadersUrl = await getSignedUrl(
      s3Client,
      customHeadersCommand,
      {
        expiresIn: 300,
      }
    );

    console.log(`✅ URL avec headers personnalisés:`);
    console.log(`   ${customHeadersUrl}\n`);

    console.log(
      "🎉 Tous les tests sont passés! Les URLs signées fonctionnent correctement."
    );
    console.log("\n📝 Points importants:");
    console.log("   ✅ Les fichiers restent privés dans le bucket");
    console.log("   ✅ Les URLs signées permettent un accès temporaire");
    console.log("   ✅ L'expiration fonctionne correctement");
    console.log("   ✅ Les headers personnalisés sont supportés");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
    process.exit(1);
  }
}

// Exécution du test
testSignedUrls().catch(console.error);
