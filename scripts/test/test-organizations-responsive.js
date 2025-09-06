/**
 * Script de test pour vérifier la responsivité de la section des organisations
 * et l'affichage des images de profil
 */

const BASE_URL = "http://localhost:3000";

async function testOrganizationsResponsive() {
  console.log(
    "🧪 Test de la responsivité de la section des organisations...\n"
  );

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

    // Test 3: Vérifier que chaque organisation a les champs requis
    console.log("\n3️⃣ Test des champs requis...");
    const organizations = data.organizations;

    if (organizations.length === 0) {
      console.log("ℹ️  Aucune organisation trouvée pour cet utilisateur");
      return;
    }

    const requiredFields = [
      "id",
      "name",
      "role",
      "memberCount",
      "profileImage",
    ];
    let allHaveRequiredFields = true;

    organizations.forEach((org, index) => {
      const missingFields = requiredFields.filter((field) => !(field in org));
      if (missingFields.length > 0) {
        console.log(
          `❌ Organisation "${org.name}" (ID: ${
            org.id
          }) manque: ${missingFields.join(", ")}`
        );
        allHaveRequiredFields = false;
      } else {
        console.log(
          `✅ Organisation "${org.name}": tous les champs requis présents`
        );
      }
    });

    if (allHaveRequiredFields) {
      console.log("\n🎉 Toutes les organisations ont tous les champs requis !");
    } else {
      console.log("\n❌ Certaines organisations manquent des champs requis");
    }

    // Test 4: Vérifier les images de profil
    console.log("\n4️⃣ Test des images de profil...");
    const orgsWithImages = organizations.filter((org) => org.profileImage);
    const orgsWithoutImages = organizations.filter((org) => !org.profileImage);

    console.log(`📸 Organisations avec image: ${orgsWithImages.length}`);
    orgsWithImages.forEach((org) => {
      console.log(`   - "${org.name}": ${org.profileImage}`);
    });

    console.log(`🖼️  Organisations sans image: ${orgsWithoutImages.length}`);
    orgsWithoutImages.forEach((org) => {
      console.log(`   - "${org.name}": pas d'image`);
    });

    // Test 5: Vérifier les rôles
    console.log("\n5️⃣ Test des rôles...");
    const validRoles = ["OWNER", "ADMIN", "MEMBER"];
    const roleCounts = {};

    organizations.forEach((org) => {
      roleCounts[org.role] = (roleCounts[org.role] || 0) + 1;
    });

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count} organisation(s)`);
    });

    // Test 6: Afficher un résumé détaillé
    console.log("\n📊 Résumé détaillé des organisations:");
    organizations.forEach((org, index) => {
      const hasImage = org.profileImage ? "✅" : "❌";
      const memberText = org.memberCount === 1 ? "membre" : "membres";

      console.log(`   ${index + 1}. ${org.name}`);
      console.log(`      Rôle: ${org.role}`);
      console.log(`      Membres: ${org.memberCount} ${memberText}`);
      console.log(
        `      Image: ${hasImage} ${org.profileImage || "Aucune image"}`
      );
      console.log("");
    });

    // Test 7: Vérifier la responsivité des données
    console.log("\n7️⃣ Test de la responsivité des données...");
    console.log("💡 Pour tester la responsivité visuelle:");
    console.log("   1. Allez sur la page de profil");
    console.log('   2. Ouvrez la section "Organisations"');
    console.log("   3. Redimensionnez la fenêtre du navigateur");
    console.log("   4. Vérifiez que la grille s'adapte:");
    console.log("      - Mobile (1 colonne)");
    console.log("      - Tablette (2 colonnes)");
    console.log("      - Desktop (3 colonnes)");
    console.log("      - Large (4 colonnes)");
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
  testOrganizationsResponsive();
}

module.exports = { testOrganizationsResponsive };
