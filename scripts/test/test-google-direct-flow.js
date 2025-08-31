const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

console.log("🔧 Test du flux de connexion Google direct\n");

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

console.log("\n🔗 URLs de test:");
console.log(
  "   ✅ Route directe: http://localhost:3000/api/auth/google-direct?callbackUrl=/"
);
console.log(
  "   ✅ Callback NextAuth: http://localhost:3000/api/auth/callback/google"
);
console.log("   ✅ Page de login: http://localhost:3000/auth/login");

console.log("\n📝 Configuration Google Cloud Console requise:");
console.log("   ✅ Authorized JavaScript origins: http://localhost:3000");
console.log(
  "   ✅ Authorized redirect URIs: http://localhost:3000/api/auth/callback/google"
);

console.log("\n🔄 Flux attendu:");
console.log("   1. Clic sur 'Continuer avec Google'");
console.log("   2. Redirection vers: /api/auth/google-direct?callbackUrl=/");
console.log(
  "   3. Redirection directe vers: https://accounts.google.com/o/oauth2/v2/auth?..."
);
console.log(
  "   4. Après authentification Google, callback vers: /api/auth/callback/google"
);
console.log("   5. Création/mise à jour utilisateur dans la base de données");
console.log("   6. Redirection finale vers: /");

console.log("\n🧪 Test de la configuration:");
if (allVarsPresent) {
  console.log("   ✅ Configuration correcte");
  console.log("   → Redémarrez le serveur: pnpm dev");
  console.log("   → Testez: http://localhost:3000/auth/login");
  console.log("   → Cliquez sur 'Continuer avec Google'");
} else {
  console.log("   ❌ Configuration incorrecte");
  console.log("   → Vérifiez les variables d'environnement manquantes");
}

console.log("\n📚 Résultat attendu:");
console.log(
  "   ✅ Redirection directe vers Google (pas de page intermédiaire)"
);
console.log("   ✅ Utilisateur créé/mis à jour dans la base de données");
console.log("   ✅ Redirection vers la page d'accueil après connexion");
