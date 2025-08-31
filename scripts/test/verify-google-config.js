const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

console.log("🔧 Vérification de la configuration Google Cloud Console\n");

// Vérification des variables d'environnement
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

console.log("📋 Variables d'environnement:");
console.log(`   ✅ GOOGLE_CLIENT_ID: ${clientId ? "Présent" : "❌ Manquant"}`);
console.log(
  `   ✅ GOOGLE_CLIENT_SECRET: ${clientSecret ? "Présent" : "❌ Manquant"}`
);
console.log(`   ✅ NEXTAUTH_URL: ${nextAuthUrl || "❌ Manquant"}`);

if (!clientId || !clientSecret || !nextAuthUrl) {
  console.log("\n❌ Variables d'environnement manquantes");
  process.exit(1);
}

console.log("\n🔗 URLs de redirection requises dans Google Cloud Console:");
console.log("\n📝 Authorized JavaScript origins:");
console.log(`   ✅ ${nextAuthUrl}`);

console.log("\n📝 Authorized redirect URIs:");
console.log(`   ✅ ${nextAuthUrl}/api/auth/callback/google`);

console.log("\n🔍 Vérification du format du Client ID:");
if (clientId.includes(".apps.googleusercontent.com")) {
  console.log("   ✅ Format du Client ID correct");
} else {
  console.log("   ❌ Format du Client ID incorrect");
  console.log(
    "   → Le Client ID doit se terminer par .apps.googleusercontent.com"
  );
}

console.log("\n📚 Étapes de vérification dans Google Cloud Console:");
console.log("   1. Allez sur: https://console.cloud.google.com/");
console.log("   2. Sélectionnez votre projet");
console.log("   3. APIs & Services > Credentials");
console.log("   4. Cliquez sur votre OAuth 2.0 Client ID");
console.log("   5. Vérifiez les URLs autorisées ci-dessus");

console.log("\n⚠️  Erreur 401 invalid_client possible si:");
console.log("   → Les URLs de redirection ne correspondent pas");
console.log("   → Le Client ID est incorrect");
console.log("   → Le Client Secret est incorrect");
console.log("   → L'API Google+ n'est pas activée");

console.log("\n🧪 Test de la configuration:");
console.log("   → Redémarrez le serveur: pnpm dev");
console.log("   → Testez: http://localhost:3000/auth/login");
console.log("   → Cliquez sur 'Continuer avec Google'");
