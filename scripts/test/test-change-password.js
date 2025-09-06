/**
 * Script de test pour la fonctionnalité de changement de mot de passe
 * Teste l'API route et la logique de validation
 */

const API_BASE_URL = "http://localhost:3000";

async function testChangePasswordAPI() {
  console.log("🧪 Test de l'API de changement de mot de passe\n");

  // Test 1: Vérification de l'utilisateur Google
  console.log("1. Test de vérification utilisateur Google...");
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/check-google-user`,
      {
        credentials: "include",
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Succès:", data);
    } else {
      console.log("❌ Erreur:", response.status, response.statusText);
    }
  } catch (error) {
    console.log("❌ Erreur de connexion:", error.message);
  }

  // Test 2: Tentative de changement de mot de passe (sans authentification)
  console.log(
    "\n2. Test de changement de mot de passe sans authentification..."
  );
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: "ancien123",
          newPassword: "nouveau123",
          confirmPassword: "nouveau123",
        }),
      }
    );

    if (response.status === 401) {
      console.log("✅ Correctement rejeté (non authentifié)");
    } else {
      console.log("❌ Devrait être rejeté:", response.status);
    }
  } catch (error) {
    console.log("❌ Erreur de connexion:", error.message);
  }

  // Test 3: Validation des données
  console.log("\n3. Test de validation des données...");
  const testCases = [
    {
      name: "Mots de passe qui ne correspondent pas",
      data: {
        currentPassword: "ancien123",
        newPassword: "nouveau123",
        confirmPassword: "different123",
      },
      expectedStatus: 400,
    },
    {
      name: "Mot de passe trop court",
      data: {
        currentPassword: "ancien123",
        newPassword: "123",
        confirmPassword: "123",
      },
      expectedStatus: 400,
    },
    {
      name: "Champs manquants",
      data: {
        currentPassword: "ancien123",
        newPassword: "nouveau123",
        // confirmPassword manquant
      },
      expectedStatus: 400,
    },
  ];

  for (const testCase of testCases) {
    console.log(`   - ${testCase.name}...`);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/profile/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testCase.data),
        }
      );

      if (response.status === testCase.expectedStatus) {
        console.log("     ✅ Correctement rejeté");
      } else {
        console.log(
          `     ❌ Statut incorrect: ${response.status} (attendu: ${testCase.expectedStatus})`
        );
      }
    } catch (error) {
      console.log("     ❌ Erreur de connexion:", error.message);
    }
  }

  console.log("\n🎯 Tests terminés !");
  console.log("\n📝 Pour tester avec authentification:");
  console.log("   1. Connectez-vous à l'application");
  console.log("   2. Allez dans le profil");
  console.log("   3. Testez la section sécurité");
}

// Exécution des tests
if (require.main === module) {
  testChangePasswordAPI().catch(console.error);
}

module.exports = { testChangePasswordAPI };
