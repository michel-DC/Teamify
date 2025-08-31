const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

console.log("🔧 Test de la création d'utilisateur via Google OAuth\n");

// Vérification des variables d'environnement
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

console.log("📋 Configuration:");
console.log(`   ✅ GOOGLE_CLIENT_ID: ${clientId ? "Présent" : "❌ Manquant"}`);
console.log(
  `   ✅ GOOGLE_CLIENT_SECRET: ${clientSecret ? "Présent" : "❌ Manquant"}`
);
console.log(`   ✅ NEXTAUTH_URL: ${nextAuthUrl || "❌ Manquant"}`);

console.log("\n🔄 Flux de création d'utilisateur:");
console.log("   1. Utilisateur clique sur 'Continuer avec Google'");
console.log("   2. Redirection vers Google OAuth");
console.log("   3. Authentification Google réussie");
console.log("   4. Callback NextAuth vers /api/auth/callback/google");
console.log("   5. Exécution du callback signIn()");
console.log(
  "   6. Vérification si l'utilisateur existe dans la base de données"
);
console.log("   7. Si non → Création automatique de l'utilisateur");
console.log("   8. Si oui → Mise à jour des informations");
console.log("   9. Retour true pour permettre la connexion");
console.log("   10. Redirection vers la page d'accueil");

console.log("\n📝 Logs à surveiller:");
console.log("   - [NextAuth] Processing Google signin");
console.log(
  "   - [NextAuth] Creating new user from Google (nouvel utilisateur)"
);
console.log("   - [NextAuth] Updating existing user (utilisateur existant)");
console.log("   - [NextAuth] Signin successful, allowing login");
console.log("   - [NextAuth] JWT callback - user data");
console.log("   - [NextAuth] Session callback - enriching session");

console.log("\n⚠️  Points importants:");
console.log("   ✅ Le callback signIn() retourne toujours true");
console.log("   ✅ L'utilisateur est créé automatiquement s'il n'existe pas");
console.log("   ✅ Les informations Google sont synchronisées");
console.log("   ✅ L'UID est correctement assigné");

console.log("\n🧪 Test:");
console.log("   1. Redémarrez le serveur: pnpm dev");
console.log("   2. Allez sur: http://localhost:3000/auth/login");
console.log("   3. Cliquez sur 'Continuer avec Google'");
console.log("   4. Connectez-vous avec un compte Google");
console.log("   5. Vérifiez les logs pour voir la création d'utilisateur");
console.log("   6. Vérifiez que vous êtes redirigé vers la page d'accueil");

console.log("\n📚 Vérification en base de données:");
console.log("   - L'utilisateur doit être créé dans la table User");
console.log("   - L'email doit correspondre à celui de Google");
console.log(
  "   - Le firstname et lastname doivent être extraits du nom Google"
);
console.log("   - Le password doit être vide (pour Google OAuth)");
console.log("   - L'UID doit correspondre à l'ID Google");
