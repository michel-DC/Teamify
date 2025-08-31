/**
 * Script pour tester l'initialisation du provider Google
 * Exécutez avec: node scripts/test-google-provider.js
 */

require("dotenv").config();
const GoogleProvider = require("next-auth/providers/google").default;

console.log("🔍 Test d'initialisation du provider Google\n");

// Vérifier les variables d'environnement
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

console.log("📋 Variables d'environnement:");
console.log(
  `   GOOGLE_CLIENT_ID: ${clientId ? "✅" : "❌"} ${
    clientId ? clientId.substring(0, 10) + "..." : "Manquant"
  }`
);
console.log(
  `   GOOGLE_CLIENT_SECRET: ${clientSecret ? "✅" : "❌"} ${
    clientSecret ? clientSecret.substring(0, 10) + "..." : "Manquant"
  }`
);
console.log(
  `   NEXTAUTH_URL: ${nextAuthUrl ? "✅" : "❌"} ${nextAuthUrl || "Manquant"}`
);

// Tester l'initialisation du provider
try {
  console.log("\n🔧 Test d'initialisation du provider Google...");

  const provider = GoogleProvider({
    clientId: clientId,
    clientSecret: clientSecret,
  });

  console.log("✅ Provider Google initialisé avec succès !");
  console.log(`   ID: ${provider.id}`);
  console.log(`   Name: ${provider.name}`);
  console.log(`   Type: ${provider.type}`);

  // Vérifier la configuration
  if (provider.authorization) {
    console.log("✅ Configuration authorization présente");
  } else {
    console.log("❌ Configuration authorization manquante");
  }
} catch (error) {
  console.error("❌ Erreur lors de l'initialisation du provider Google:");
  console.error(`   ${error.message}`);
  console.error(`   Stack: ${error.stack}`);
}

console.log("\n📝 Prochaines étapes:");
console.log(
  "1. Vérifiez que GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google"
);
console.log("2. Redémarrez le serveur: pnpm dev");
console.log("3. Testez la connexion Google");

console.log("\n✅ Test terminé !");
