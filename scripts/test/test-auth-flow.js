/**
 * Script de test pour vérifier le flux d'authentification complet
 */

require("dotenv").config();

console.log("🧪 Test du flux d'authentification complet\n");

// Vérifier les variables d'environnement
const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "JWT_SECRET",
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
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

// Tester la base de données
console.log("🗄️ Test de la base de données :");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    // Test de connexion
    await prisma.$queryRaw`SELECT 1`;
    console.log("  ✅ Connexion à la base de données réussie");

    // Vérifier les utilisateurs Google
    const googleUsers = await prisma.user.findMany({
      where: { googleId: { not: null } },
      select: { uid: true, email: true, googleId: true },
    });

    console.log(`  👥 Utilisateurs Google trouvés : ${googleUsers.length}`);
    if (googleUsers.length > 0) {
      googleUsers.forEach((user) => {
        console.log(`    - ${user.email} (${user.googleId})`);
      });
    }

    // Vérifier les organisations
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true, ownerUid: true },
    });

    console.log(`  🏢 Organisations trouvées : ${organizations.length}`);
    if (organizations.length > 0) {
      organizations.forEach((org) => {
        console.log(`    - ${org.name} (owner: ${org.ownerUid})`);
      });
    }
  } catch (error) {
    console.error("  ❌ Erreur de base de données :", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Tester les routes API
console.log("\n🔗 Test des routes API :");

async function testApiRoutes() {
  const baseUrl = "http://localhost:3000";

  try {
    // Test de la route /api/auth/me sans authentification
    console.log("  📡 Test /api/auth/me (sans auth) :");
    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      credentials: "include",
    });

    console.log(`    Status: ${meResponse.status}`);
    if (meResponse.status === 401) {
      console.log("    ✅ Correctement rejeté (401)");
    } else {
      console.log("    ⚠️ Réponse inattendue");
    }

    // Test de la route de callback
    console.log("  📡 Test /api/auth/google/callback :");
    const callbackResponse = await fetch(
      `${baseUrl}/api/auth/google/callback?code=test`
    );

    console.log(`    Status: ${callbackResponse.status}`);
    if (callbackResponse.status === 307) {
      console.log("    ✅ Redirection correcte (307)");
    } else {
      console.log("    ⚠️ Réponse inattendue");
    }
  } catch (error) {
    console.error("  ❌ Erreur API :", error.message);
  }
}

// Exécuter les tests
async function runTests() {
  await testDatabase();
  await testApiRoutes();

  console.log("\n✅ Tests terminés");
  console.log("\n📝 Instructions pour tester :");
  console.log("  1. Démarrez le serveur : pnpm dev");
  console.log("  2. Allez sur http://localhost:3000/auth/login");
  console.log("  3. Cliquez sur 'Continuer avec Google'");
  console.log("  4. Vérifiez que vous êtes redirigé vers /create-organization");
  console.log(
    "  5. Vérifiez que vous restez sur cette page (pas de redirection vers /auth/login)"
  );
}

runTests().catch(console.error);
