/**
 * Script de test pour vérifier la configuration Google OAuth
 * Exécutez avec: node scripts/test-google-auth.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Test de configuration Google OAuth pour Teamify\n");

// Vérifier les variables d'environnement
const envPath = path.join(process.cwd(), ".env");
const envExists = fs.existsSync(envPath);

console.log("📋 Vérification des variables d'environnement:");
console.log(`   .env existe: ${envExists ? "✅" : "❌"}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, "utf8");

  const requiredVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "JWT_SECRET",
    "GOOGLE_REDIRECT_URI",
  ];

  requiredVars.forEach((varName) => {
    const hasVar = envContent.includes(varName);
    console.log(`   ${varName}: ${hasVar ? "✅" : "❌"}`);
  });
}

// Vérifier les fichiers de configuration
console.log("\n📁 Vérification des fichiers de configuration:");

const configFiles = [
  "src/lib/nextauth-config.ts",
  "src/app/api/auth/[...nextauth]/route.ts",
  "src/lib/auth-bridge.ts",
  "src/app/api/auth/sync-nextauth/route.ts",
  "src/components/providers/auth-provider.tsx",
  "src/hooks/useAuth.ts",
];

configFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${file}: ${exists ? "✅" : "❌"}`);
});

// Vérifier les dépendances
console.log("\n📦 Vérification des dépendances:");

const packageJsonPath = path.join(process.cwd(), "package.json");
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  const requiredDeps = ["next-auth", "@next-auth/prisma-adapter"];

  requiredDeps.forEach((dep) => {
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`   ${dep}: ${hasDep ? "✅" : "❌"}`);
  });
}

// Instructions de test
console.log("\n🚀 Instructions de test:");
console.log("1. Démarrez le serveur: pnpm dev");
console.log("2. Allez sur: http://localhost:3000/auth/login");
console.log('3. Cliquez sur "Continuer avec Google"');
console.log("4. Vérifiez les logs dans la console du serveur");
console.log("5. Vérifiez que l'utilisateur est créé en base de données");

console.log("\n📝 Logs à surveiller:");
console.log("   - [NextAuth] signIn callback started");
console.log("   - [AuthBridge] getCurrentUserHybrid started");
console.log("   - [SyncAPI] POST /api/auth/sync-nextauth started");
console.log("   - [useAuth] Starting Google login");

console.log("\n✅ Configuration terminée !");
