const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

console.log("🔧 Test de la configuration Google OAuth après corrections\n");

// Vérification des variables d'environnement
const requiredVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_URL",
  "JWT_SECRET",
];

console.log("📋 Variables d'environnement requises:");
let allVarsPresent = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? "✅" : "❌";
  console.log(`   ${status} ${varName}: ${value ? "Présent" : "Manquant"}`);
  if (!value) allVarsPresent = false;
});

// Vérification spécifique de GOOGLE_REDIRECT_URI
const hasRedirectUri = !!process.env.GOOGLE_REDIRECT_URI;
console.log(
  `\n⚠️  GOOGLE_REDIRECT_URI: ${
    hasRedirectUri ? "❌ PRÉSENT (à supprimer)" : "✅ ABSENT (correct)"
  }`
);

if (hasRedirectUri) {
  console.log("   → Cette variable doit être supprimée du fichier .env");
  console.log("   → NextAuth génère automatiquement le redirect_uri");
}

console.log("\n🔗 URLs de test:");
console.log(
  "   ✅ URL de connexion Google: http://localhost:3000/api/auth/signin/google"
);
console.log(
  "   ✅ URL de callback: http://localhost:3000/api/auth/callback/google"
);

console.log("\n📝 Configuration Google Cloud Console requise:");
console.log("   ✅ Authorized JavaScript origins: http://localhost:3000");
console.log(
  "   ✅ Authorized redirect URIs: http://localhost:3000/api/auth/callback/google"
);

console.log("\n🧪 Test de la configuration:");
if (allVarsPresent && !hasRedirectUri) {
  console.log("   ✅ Configuration correcte");
  console.log("   → Redémarrez le serveur: pnpm dev");
  console.log("   → Testez: http://localhost:3000/api/auth/signin/google");
} else {
  console.log("   ❌ Configuration incorrecte");
  if (!allVarsPresent) {
    console.log("   → Vérifiez les variables d'environnement manquantes");
  }
  if (hasRedirectUri) {
    console.log("   → Supprimez GOOGLE_REDIRECT_URI du fichier .env");
  }
}

console.log("\n📚 Résultat attendu:");
console.log(
  "   ✅ Redirection vers: https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
);
console.log("   ❌ Éviter: /auth/login?error=google");
