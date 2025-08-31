/**
 * Script de test pour l'authentification Google OAuth
 * Teste la configuration et les endpoints
 */

require("dotenv").config();

console.log("🧪 Test de l'authentification Google OAuth\n");

// Vérifier les variables d'environnement
const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_URL",
  "JWT_SECRET",
];

console.log("📋 Vérification des variables d'environnement :");
let allEnvVarsPresent = true;

requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  const isPresent = !!value;
  const status = isPresent ? "✅" : "❌";

  console.log(`  ${status} ${envVar}: ${isPresent ? "Présent" : "Manquant"}`);

  if (!isPresent) {
    allEnvVarsPresent = false;
  }
});

console.log();

if (!allEnvVarsPresent) {
  console.log(
    "❌ Variables d'environnement manquantes. Veuillez les configurer."
  );
  process.exit(1);
}

// Tester la construction de l'URL d'autorisation
console.log("🔗 Test de construction de l'URL d'autorisation :");

const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
googleAuthUrl.searchParams.set(
  "redirect_uri",
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
);
googleAuthUrl.searchParams.set("response_type", "code");
googleAuthUrl.searchParams.set("scope", "openid email profile");
googleAuthUrl.searchParams.set("access_type", "offline");
googleAuthUrl.searchParams.set("prompt", "consent");

console.log(`  URL d'autorisation : ${googleAuthUrl.toString()}`);
console.log();

// Tester la configuration de la base de données
console.log("🗄️ Test de la configuration de la base de données :");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    // Test de connexion
    await prisma.$queryRaw`SELECT 1`;
    console.log("  ✅ Connexion à la base de données réussie");

    // Vérifier si la table User existe et a les bonnes colonnes
    const userTable = await prisma.$queryRaw`
       SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'User' 
       AND column_name IN ('uid', 'email', 'password', 'firstname', 'lastname', 'profileImage', 'googleId')
     `;

    const requiredColumns = [
      "uid",
      "email",
      "password",
      "firstname",
      "lastname",
      "profileImage",
      "googleId",
    ];
    const existingColumns = userTable.map((col) => col.column_name);

    console.log("  📊 Colonnes de la table User :");
    requiredColumns.forEach((col) => {
      const exists = existingColumns.includes(col);
      console.log(`    ${exists ? "✅" : "❌"} ${col}`);
    });

    if (existingColumns.includes("googleId")) {
      console.log("  ✅ La colonne googleId est présente");
    } else {
      console.log(
        "  ❌ La colonne googleId est manquante - exécutez la migration"
      );
    }
  } catch (error) {
    console.error("  ❌ Erreur de base de données :", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase().then(() => {
  console.log("\n✅ Test terminé");
  console.log("\n📝 Prochaines étapes :");
  console.log(
    "  1. Assurez-vous que NEXT_PUBLIC_GOOGLE_CLIENT_ID est défini dans .env.local"
  );
  console.log("  2. Exécutez la migration Prisma si nécessaire");
  console.log("  3. Testez le bouton Google sur la page de connexion");
});
