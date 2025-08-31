/**
 * Script pour vérifier la configuration Google OAuth
 * Exécutez avec: node scripts/check-google-config.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Vérification de la configuration Google OAuth\n");

// Vérifier les variables d'environnement
const envPath = path.join(process.cwd(), ".env");
const envExists = fs.existsSync(envPath);

console.log("📋 Variables d'environnement:");
console.log(`   .env existe: ${envExists ? "✅" : "❌"}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, "utf8");

  const requiredVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "JWT_SECRET",
  ];

  const optionalVars = ["GOOGLE_REDIRECT_URI", "NEXTAUTH_URL"];

  console.log("\n   Variables requises:");
  requiredVars.forEach((varName) => {
    const hasVar = envContent.includes(varName);
    console.log(`   ${varName}: ${hasVar ? "✅" : "❌"}`);
  });

  console.log("\n   Variables optionnelles:");
  optionalVars.forEach((varName) => {
    const hasVar = envContent.includes(varName);
    console.log(`   ${varName}: ${hasVar ? "✅" : "❌"}`);
  });

  // Extraire les valeurs pour vérification
  const getEnvValue = (varName) => {
    const match = envContent.match(new RegExp(`^${varName}=(.+)$`, "m"));
    return match ? match[1] : null;
  };

  const clientId = getEnvValue("GOOGLE_CLIENT_ID");
  const redirectUri = getEnvValue("GOOGLE_REDIRECT_URI");
  const nextAuthUrl = getEnvValue("NEXTAUTH_URL");

  console.log("\n🔧 Configuration recommandée:");

  if (!nextAuthUrl) {
    console.log("   ❌ NEXTAUTH_URL manquant");
    console.log("   ✅ Ajoutez: NEXTAUTH_URL=http://localhost:3000");
  } else {
    console.log(`   ✅ NEXTAUTH_URL: ${nextAuthUrl}`);
  }

  if (
    redirectUri &&
    redirectUri !== "http://localhost:3000/api/auth/callback/google"
  ) {
    console.log("   ⚠️  GOOGLE_REDIRECT_URI incorrect");
    console.log(
      "   ✅ Changez vers: GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google"
    );
  } else if (redirectUri) {
    console.log(`   ✅ GOOGLE_REDIRECT_URI: ${redirectUri}`);
  } else {
    console.log("   ❌ GOOGLE_REDIRECT_URI manquant");
    console.log(
      "   ✅ Ajoutez: GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google"
    );
  }

  if (clientId) {
    console.log(`   ✅ GOOGLE_CLIENT_ID: ${clientId.substring(0, 10)}...`);
  }
}

console.log("\n📝 Instructions de correction:");
console.log("1. Modifiez votre .env avec les valeurs recommandées");
console.log("2. Redémarrez le serveur: pnpm dev");
console.log("3. Testez la connexion Google");

console.log("\n✅ Vérification terminée !");
