const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

console.log("🔧 Diagnostic du problème Google OAuth\n");

// Vérification des variables d'environnement
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;
const jwtSecret = process.env.JWT_SECRET;

console.log("📋 Variables d'environnement:");
console.log(`   ✅ GOOGLE_CLIENT_ID: ${clientId ? "Présent" : "❌ Manquant"}`);
console.log(
  `   ✅ GOOGLE_CLIENT_SECRET: ${clientSecret ? "Présent" : "❌ Manquant"}`
);
console.log(`   ✅ NEXTAUTH_URL: ${nextAuthUrl || "❌ Manquant"}`);
console.log(`   ✅ JWT_SECRET: ${jwtSecret ? "Présent" : "❌ Manquant"}`);

if (!clientId || !clientSecret || !nextAuthUrl || !jwtSecret) {
  console.log("\n❌ Variables d'environnement manquantes");
  process.exit(1);
}

console.log("\n🔗 URLs de test:");
console.log(
  "   ✅ URL de connexion directe: http://localhost:3000/api/auth/signin/google"
);
console.log(
  "   ✅ URL de callback: http://localhost:3000/api/auth/callback/google"
);

console.log("\n📝 Configuration Google Cloud Console requise:");
console.log("   ✅ Authorized JavaScript origins:");
console.log(`      - ${nextAuthUrl}`);
console.log("   ✅ Authorized redirect URIs:");
console.log(`      - ${nextAuthUrl}/api/auth/callback/google`);

console.log("\n🔍 Diagnostic des problèmes courants:");

// Vérifier le format du Client ID
if (!clientId.includes(".apps.googleusercontent.com")) {
  console.log("   ❌ Format du Client ID incorrect");
} else {
  console.log("   ✅ Format du Client ID correct");
}

// Vérifier la longueur du Client Secret
if (clientSecret.length < 20) {
  console.log("   ❌ Client Secret trop court");
} else {
  console.log("   ✅ Client Secret semble correct");
}

// Vérifier l'URL NextAuth
if (!nextAuthUrl.startsWith("http")) {
  console.log("   ❌ NEXTAUTH_URL doit commencer par http:// ou https://");
} else {
  console.log("   ✅ NEXTAUTH_URL format correct");
}

console.log("\n⚠️  Solutions possibles:");
console.log(
  "   1. Vérifiez dans Google Cloud Console que les URLs correspondent exactement"
);
console.log("   2. Assurez-vous que l'API Google+ est activée");
console.log("   3. Vérifiez que le Client ID et Secret sont corrects");
console.log("   4. Essayez de supprimer et recréer les credentials OAuth");

console.log("\n🧪 Test manuel:");
console.log("   1. Allez sur: http://localhost:3000/api/auth/signin/google");
console.log("   2. Vous devriez voir la page de connexion Google");
console.log("   3. Si erreur, vérifiez les logs du serveur");

console.log("\n📚 Logs à surveiller:");
console.log("   - [NextAuth][Error] pour les erreurs d'authentification");
console.log("   - [NextAuth][Debug] pour les détails du flux OAuth");
console.log("   - Erreurs 401 ou 403 dans les logs du serveur");
