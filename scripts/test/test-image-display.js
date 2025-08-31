const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

/**
 * @param Script de test pour vérifier l'affichage des images
 */
async function testImageDisplay() {
  console.log("🖼️  Test de l'affichage des images...\n");

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
  const testFileName = `test-image-${Date.now()}.txt`;
  const testContent = "Test image content";

  try {
    // Test 1: Upload d'un fichier
    console.log("📤 Test 1: Upload d'un fichier...");
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: testFileName,
      Body: testContent,
      ContentType: "text/plain",
    });

    await s3Client.send(uploadCommand);
    console.log(`✅ Fichier uploadé: ${testFileName}\n`);

    // Test 2: Test de l'API de génération d'URL signée
    console.log("🔐 Test 2: Test de l'API de génération d'URL signée...");

    const imageUrl = `https://24209da4d5dada18fc8dc25e19f8d004.r2.cloudflarestorage.com/${bucketName}/${testFileName}`;

    const response = await fetch(
      "http://localhost:3000/api/images/signed-url",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API fonctionne correctement");
      console.log(
        `   URL signée générée: ${data.signedUrl.substring(0, 100)}...`
      );
      console.log(`   Expires in: ${data.expiresIn} secondes`);
    } else {
      console.log(`❌ Erreur API: ${response.status} ${response.statusText}`);
    }

    console.log("\n🎉 Tests terminés !");
    console.log("\n📝 Pour tester l'affichage des images :");
    console.log("   1. Démarrez votre serveur de développement");
    console.log("   2. Allez sur le dashboard des événements");
    console.log("   3. Vérifiez que les images s'affichent correctement");
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error);
  } finally {
    // Nettoyage
    try {
      console.log("\n🧹 Nettoyage...");
      const deleteCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: testFileName,
        Body: "",
      });
      await s3Client.send(deleteCommand);
      console.log("✅ Fichier de test supprimé");
    } catch (cleanupError) {
      console.warn("⚠️  Erreur lors du nettoyage:", cleanupError.message);
    }
  }
}

// Exécution du test
testImageDisplay().catch(console.error);
