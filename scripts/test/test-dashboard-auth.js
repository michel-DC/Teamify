/**
 * Script de test pour vérifier l'authentification du dashboard
 */

require("dotenv").config();

console.log("🧪 Test de l'authentification du dashboard\n");

// Vérifier les variables d'environnement
const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
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

    // Vérifier les organisations et leurs propriétaires
    const organizations = await prisma.organization.findMany({
      include: {
        owner: {
          select: { uid: true, email: true },
        },
      },
    });

    console.log(`  🏢 Organisations trouvées : ${organizations.length}`);
    if (organizations.length > 0) {
      organizations.forEach((org) => {
        console.log(`    - ${org.name} (owner: ${org.owner.email})`);
      });
    }

    // Vérifier les membres d'organisation
    const members = await prisma.organizationMember.findMany({
      include: {
        user: {
          select: { uid: true, email: true },
        },
        organization: {
          select: { name: true },
        },
      },
    });

    console.log(`  👤 Membres d'organisation trouvés : ${members.length}`);
    if (members.length > 0) {
      members.forEach((member) => {
        console.log(
          `    - ${member.user.email} dans ${member.organization.name} (${member.role})`
        );
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

    // Test de la route /api/user/has-organization sans authentification
    console.log("  📡 Test /api/user/has-organization (sans auth) :");
    const hasOrgResponse = await fetch(`${baseUrl}/api/user/has-organization`, {
      credentials: "include",
    });

    console.log(`    Status: ${hasOrgResponse.status}`);
    if (hasOrgResponse.status === 401) {
      console.log("    ✅ Correctement rejeté (401)");
    } else {
      console.log("    ⚠️ Réponse inattendue");
    }

    // Test de la route /api/user/organizations sans authentification
    console.log("  📡 Test /api/user/organizations (sans auth) :");
    const orgsResponse = await fetch(`${baseUrl}/api/user/organizations`, {
      credentials: "include",
    });

    console.log(`    Status: ${orgsResponse.status}`);
    if (orgsResponse.status === 401) {
      console.log("    ✅ Correctement rejeté (401)");
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
  console.log("\n📝 Instructions pour tester le dashboard :");
  console.log("  1. Démarrez le serveur : pnpm dev");
  console.log("  2. Allez sur http://localhost:3000/auth/login");
  console.log("  3. Cliquez sur 'Continuer avec Google'");
  console.log(
    "  4. Si vous avez une organisation, vous devriez être redirigé vers /dashboard"
  );
  console.log(
    "  5. Si vous n'avez pas d'organisation, vous devriez être redirigé vers /create-organization"
  );
  console.log(
    "  6. Après avoir créé une organisation, vous devriez pouvoir accéder au dashboard"
  );
}

runTests().catch(console.error);
