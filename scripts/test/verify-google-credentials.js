/**
 * Script pour vérifier les credentials Google
 * Exécutez avec: node scripts/verify-google-credentials.js
 */

require("dotenv").config();

console.log("🔍 Vérification des credentials Google\n");

// Vérifier les variables d'environnement
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

console.log("📋 Variables d'environnement:");
console.log(
  `   GOOGLE_CLIENT_ID: ${clientId ? "✅" : "❌"} ${
    clientId ? clientId.substring(0, 20) + "..." : "Manquant"
  }`
);
console.log(
  `   GOOGLE_CLIENT_SECRET: ${clientSecret ? "✅" : "❌"} ${
    clientSecret ? clientSecret.substring(0, 20) + "..." : "Manquant"
  }`
);
console.log(
  `   GOOGLE_REDIRECT_URI: ${redirectUri ? "✅" : "❌"} ${
    redirectUri || "Manquant"
  }`
);

// Vérifier le format des credentials
console.log("\n🔧 Vérification du format:");

if (clientId) {
  if (clientId.includes("googleusercontent.com")) {
    console.log("   ✅ GOOGLE_CLIENT_ID: Format Google valide");
  } else {
    console.log(
      "   ⚠️  GOOGLE_CLIENT_ID: Format suspect (devrait contenir googleusercontent.com)"
    );
  }
}

if (clientSecret) {
  if (clientSecret.startsWith("GOCSPX-")) {
    console.log("   ✅ GOOGLE_CLIENT_SECRET: Format Google valide");
  } else {
    console.log(
      "   ⚠️  GOOGLE_CLIENT_SECRET: Format suspect (devrait commencer par GOCSPX-)"
    );
  }
}

if (redirectUri) {
  if (redirectUri === "http://localhost:3000/api/auth/callback/google") {
    console.log("   ✅ GOOGLE_REDIRECT_URI: URL correcte");
  } else {
    console.log("   ⚠️  GOOGLE_REDIRECT_URI: URL incorrecte");
    console.log(`      Actuel: ${redirectUri}`);
    console.log(
      "      Attendu: http://localhost:3000/api/auth/callback/google"
    );
  }
}

// Instructions pour Google Cloud Console
console.log("\n📝 Instructions pour Google Cloud Console:");
console.log("1. Allez sur https://console.cloud.google.com/");
console.log("2. Sélectionnez votre projet");
console.log('3. Allez dans "APIs & Services" > "Credentials"');
console.log("4. Trouvez votre OAuth 2.0 Client ID");
console.log("5. Vérifiez que ces URLs sont autorisées:");
console.log("   - Authorized JavaScript origins:");
console.log("     * http://localhost:3000");
console.log("   - Authorized redirect URIs:");
console.log("     * http://localhost:3000/api/auth/callback/google");

// Vérifier si les URLs sont correctes
console.log("\n🔍 Vérification des URLs autorisées:");
console.log("   JavaScript origins requis: http://localhost:3000");
console.log(
  "   Redirect URIs requis: http://localhost:3000/api/auth/callback/google"
);

console.log("\n⚠️  Problèmes possibles:");
console.log("1. URLs non autorisées dans Google Cloud Console");
console.log("2. Credentials incorrects ou expirés");
console.log("3. API Google+ OAuth2 non activée");
console.log("4. Projet Google Cloud mal configuré");

console.log("\n✅ Vérification terminée !");
