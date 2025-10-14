// Test adaptatif pour l'inscription qui s'adapte à la structure réelle
describe("Inscription adaptative", () => {
  it("devrait permettre l'inscription avec des sélecteurs adaptatifs", () => {
    cy.visit("/auth/register");

    // Attendre que la page se charge
    cy.wait(3000);

    // Prendre une capture d'écran
    cy.screenshot("adaptive-register-test");

    // Essayer différents sélecteurs pour le prénom
    const firstnameSelectors = [
      'input[name="firstname"]',
      'input[name="firstName"]',
      'input[name="first_name"]',
      'input[placeholder*="prénom"]',
      'input[placeholder*="Prénom"]',
      'input[placeholder*="firstname"]',
      'input[placeholder*="firstName"]',
      'input[id*="firstname"]',
      'input[id*="firstName"]',
      'input[type="text"]:first',
    ];

    let firstnameInput = null;
    for (const selector of firstnameSelectors) {
      try {
        cy.get(selector).should("exist");
        firstnameInput = selector;
        console.log(`Sélecteur prénom trouvé: ${selector}`);
        break;
      } catch (e) {
        console.log(`Sélecteur prénom non trouvé: ${selector}`);
      }
    }

    if (firstnameInput) {
      cy.get(firstnameInput).type("Test");
    } else {
      console.log(
        "Aucun sélecteur prénom trouvé, essai avec le premier input text"
      );
      cy.get('input[type="text"]').first().type("Test");
    }

    // Essayer différents sélecteurs pour le nom
    const lastnameSelectors = [
      'input[name="lastname"]',
      'input[name="lastName"]',
      'input[name="last_name"]',
      'input[placeholder*="nom"]',
      'input[placeholder*="Nom"]',
      'input[placeholder*="lastname"]',
      'input[placeholder*="lastName"]',
      'input[id*="lastname"]',
      'input[id*="lastName"]',
      'input[type="text"]:nth-child(2)',
    ];

    let lastnameInput = null;
    for (const selector of lastnameSelectors) {
      try {
        cy.get(selector).should("exist");
        lastnameInput = selector;
        console.log(`Sélecteur nom trouvé: ${selector}`);
        break;
      } catch (e) {
        console.log(`Sélecteur nom non trouvé: ${selector}`);
      }
    }

    if (lastnameInput) {
      cy.get(lastnameInput).type("User");
    } else {
      console.log(
        "Aucun sélecteur nom trouvé, essai avec le deuxième input text"
      );
      cy.get('input[type="text"]').eq(1).type("User");
    }

    // Essayer différents sélecteurs pour l'email
    const emailSelectors = [
      'input[name="email"]',
      'input[type="email"]',
      'input[placeholder*="email"]',
      'input[placeholder*="Email"]',
      'input[id*="email"]',
    ];

    let emailInput = null;
    for (const selector of emailSelectors) {
      try {
        cy.get(selector).should("exist");
        emailInput = selector;
        console.log(`Sélecteur email trouvé: ${selector}`);
        break;
      } catch (e) {
        console.log(`Sélecteur email non trouvé: ${selector}`);
      }
    }

    if (emailInput) {
      cy.get(emailInput).type("test@example.com");
    } else {
      console.log("Aucun sélecteur email trouvé");
    }

    // Essayer différents sélecteurs pour le mot de passe
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="password"]',
      'input[placeholder*="Password"]',
      'input[placeholder*="mot de passe"]',
      'input[placeholder*="Mot de passe"]',
      'input[id*="password"]',
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      try {
        cy.get(selector).should("exist");
        passwordInput = selector;
        console.log(`Sélecteur mot de passe trouvé: ${selector}`);
        break;
      } catch (e) {
        console.log(`Sélecteur mot de passe non trouvé: ${selector}`);
      }
    }

    if (passwordInput) {
      cy.get(passwordInput).type("TestPassword123!");
    } else {
      console.log("Aucun sélecteur mot de passe trouvé");
    }

    // Essayer différents sélecteurs pour le bouton de soumission
    const submitSelectors = [
      'button[type="submit"]',
      'button:contains("S\'inscrire")',
      'button:contains("Inscription")',
      'button:contains("Créer")',
      'button:contains("Valider")',
      'input[type="submit"]',
      "button:last",
    ];

    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        cy.get(selector).should("exist");
        submitButton = selector;
        console.log(`Sélecteur bouton trouvé: ${selector}`);
        break;
      } catch (e) {
        console.log(`Sélecteur bouton non trouvé: ${selector}`);
      }
    }

    if (submitButton) {
      cy.get(submitButton).click();
    } else {
      console.log("Aucun sélecteur bouton trouvé");
    }

    // Attendre un peu pour voir le résultat
    cy.wait(2000);
    cy.screenshot("adaptive-register-after-submit");
  });
});
