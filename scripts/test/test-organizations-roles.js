/**
 * Script de test pour vérifier que l'API des organisations
 * retourne bien les rôles des utilisateurs
 */

const BASE_URL = "http://localhost:3000";

async function testOrganizationsRoles() {
  console.log("🧪 Test de l'API des organisations avec rôles...\n");

  try {
    // Test 1: Vérifier que l'API est accessible
    console.log("1️⃣ Test d'accessibilité de l'API...");
    const response = await fetch(`${BASE_URL}/api/user/organizations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log("❌ API accessible mais authentification requise");
        console.log("💡 Connectez-vous d'abord à l'application");
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log("✅ API accessible");

    // Test 2: Vérifier la structure de la réponse
    console.log("\n2️⃣ Test de la structure de la réponse...");
    const data = await response.json();

    if (!data.organizations) {
      throw new Error('La réponse ne contient pas le champ "organizations"');
    }

    console.log(
      `✅ Réponse valide avec ${data.organizations.length} organisation(s)`
    );

    // Test 3: Vérifier que chaque organisation a un rôle
    console.log("\n3️⃣ Test de la présence des rôles...");
    const organizations = data.organizations;

    if (organizations.length === 0) {
      console.log("ℹ️  Aucune organisation trouvée pour cet utilisateur");
      return;
    }

    let allHaveRoles = true;
    organizations.forEach((org, index) => {
      if (!org.role) {
        console.log(
          `❌ Organisation "${org.name}" (ID: ${org.id}) n'a pas de rôle`
        );
        allHaveRoles = false;
      } else {
        console.log(`✅ Organisation "${org.name}": rôle = ${org.role}`);
      }
    });

    if (allHaveRoles) {
      console.log("\n🎉 Toutes les organisations ont un rôle défini !");
    } else {
      console.log("\n❌ Certaines organisations n'ont pas de rôle");
    }

    // Test 4: Vérifier les valeurs des rôles
    console.log("\n4️⃣ Test des valeurs des rôles...");
    const validRoles = ["OWNER", "ADMIN", "MEMBER"];
    const invalidRoles = organizations.filter(
      (org) => !validRoles.includes(org.role)
    );

    if (invalidRoles.length === 0) {
      console.log("✅ Tous les rôles ont des valeurs valides");
    } else {
      console.log("❌ Rôles invalides détectés:");
      invalidRoles.forEach((org) => {
        console.log(`   - "${org.name}": ${org.role}`);
      });
    }

    // Test 5: Afficher un résumé
    console.log("\n📊 Résumé des organisations:");
    organizations.forEach((org, index) => {
      console.log(
        `   ${index + 1}. ${org.name} (${org.role}) - ${
          org.memberCount
        } membre(s)`
      );
    });
  } catch (error) {
    console.error("\n💥 Erreur lors du test:", error.message);

    if (error.message.includes("fetch")) {
      console.log("\n💡 Vérifiez que:");
      console.log(
        "   - L'application Next.js est démarrée sur http://localhost:3000"
      );
      console.log("   - Vous êtes connecté à l'application");
      console.log("   - L'API est accessible");
    }
  }
}

// Exécution du test
if (require.main === module) {
  testOrganizationsRoles();
}

module.exports = { testOrganizationsRoles };
