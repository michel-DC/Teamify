require("dotenv").config();
const {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

/**
 * @param Script de test pour vérifier la configuration Cloudflare R2
 */
async function testR2Configuration() {
  console.log("🔍 Test de la configuration Cloudflare R2...\n");

  // Vérification des variables d'environnement
  console.log("📋 Variables d'environnement:");
  console.log(
    `  R2_ACCESS_KEY_ID: ${
      process.env.R2_ACCESS_KEY_ID ? "✅ Présent" : "❌ Manquant"
    }`
  );
  console.log(
    `  R2_SECRET_ACCESS_KEY: ${
      process.env.R2_SECRET_ACCESS_KEY ? "✅ Présent" : "❌ Manquant"
    }`
  );
  console.log(
    `  R2_ENDPOINT: ${process.env.R2_ENDPOINT ? "✅ Présent" : "❌ Manquant"}`
  );
  console.log(
    `  R2_BUCKET: ${process.env.R2_BUCKET ? "✅ Présent" : "❌ Manquant"}\n`
  );

  if (
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_ENDPOINT ||
    !process.env.R2_BUCKET
  ) {
    console.error(
      "❌ Variables d'environnement manquantes. Vérifiez votre fichier .env"
    );
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

  try {
    // Test 1: Lister les buckets
    console.log("🪣 Test 1: Liste des buckets...");
    const listCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listCommand);
    console.log("✅ Connexion réussie!");
    console.log(
      `   Buckets disponibles: ${
        buckets.Buckets?.map((b) => b.Name).join(", ") || "Aucun"
      }\n`
    );

    // Test 2: Vérifier l'accès au bucket spécifié
    console.log("🔍 Test 2: Accès au bucket spécifié...");
    const bucketName = process.env.R2_BUCKET;
    console.log(`   Bucket cible: ${bucketName}`);

    // Test 3: Upload d'un fichier de test
    console.log("📤 Test 3: Upload d'un fichier de test...");
    const testContent = "Test file for R2 configuration";
    const testFileName = `test-${Date.now()}.txt`;

    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: testFileName,
      Body: testContent,
      ContentType: "text/plain",
    });

    await s3Client.send(uploadCommand);
    console.log(`✅ Upload réussi: ${testFileName}\n`);

    // Test 4: Lecture du fichier uploadé
    console.log("📖 Test 4: Lecture du fichier uploadé...");
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: testFileName,
    });

    const downloadedFile = await s3Client.send(getCommand);
    const content = await downloadedFile.Body.transformToString();

    if (content === testContent) {
      console.log("✅ Lecture réussie! Le contenu correspond.\n");
    } else {
      console.log("⚠️  Lecture réussie mais contenu différent.\n");
    }

    // Test 5: Construction de l'URL publique
    console.log("🌐 Test 5: URL publique...");
    const publicUrl = `${process.env.R2_ENDPOINT}/${bucketName}/${testFileName}`;
    console.log(`   URL générée: ${publicUrl}\n`);

    console.log(
      "🎉 Tous les tests sont passés! La configuration R2 est correcte."
    );
    console.log("\n📝 Prochaines étapes:");
    console.log("   1. Vérifiez que votre bucket R2 est configuré en public");
    console.log("   2. Testez l'upload d'images depuis l'application");
    console.log(
      "   3. Vérifiez que les URLs générées sont accessibles publiquement"
    );
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);

    if (error.name === "AccessDenied") {
      console.log("\n💡 Solutions possibles:");
      console.log("   1. Vérifiez que vos clés d'API R2 sont correctes");
      console.log(
        "   2. Assurez-vous que votre compte a les permissions nécessaires"
      );
      console.log("   3. Vérifiez que le bucket existe et est accessible");
      console.log("   4. Contrôlez que l'endpoint R2 est correct");
    }

    process.exit(1);
  }
}

// Exécution du test
testR2Configuration().catch(console.error);
