// Test de diagnostic pour voir les vrais messages d'erreur
describe("Diagnostic des erreurs d'inscription", () => {
  it("devrait afficher les vrais messages d'erreur", () => {
    cy.visit("/auth/register");

    // Attendre que la page se charge
    cy.wait(2000);
    cy.get("body").should("be.visible");

    // Test 1: Email invalide
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("invalid-email");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");

    cy.get('button[type="submit"]').click();

    // Attendre un peu pour voir les erreurs
    cy.wait(3000);

    // Prendre une capture d'écran
    cy.screenshot("debug-email-invalid");

    // Afficher tout le contenu de la page
    cy.get("body").then(($body) => {
      console.log(
        "Contenu de la page après erreur email invalide:",
        $body.text()
      );
    });

    // Chercher tous les éléments qui pourraient contenir des erreurs
    cy.get("body").then(($body) => {
      const errorElements = $body.find(
        "[class*='error'], [class*='Error'], [class*='danger'], [class*='Danger']"
      );
      console.log("Éléments d'erreur trouvés:", errorElements.length);
      errorElements.each((index, element) => {
        console.log(`Erreur ${index}:`, element.textContent);
      });
    });

    // Chercher des messages d'erreur courants
    const errorMessages = [
      "erreur",
      "error",
      "invalid",
      "invalide",
      "required",
      "requis",
      "password",
      "mot de passe",
      "email",
      "mail",
      "format",
      "caractères",
    ];

    errorMessages.forEach((message) => {
      cy.get("body").then(($body) => {
        if ($body.text().toLowerCase().includes(message.toLowerCase())) {
          console.log(`Message d'erreur trouvé: "${message}"`);
        }
      });
    });
  });

  it("devrait afficher les vrais messages d'erreur pour mot de passe court", () => {
    cy.visit("/auth/register");

    // Test 2: Mot de passe trop court
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("123");
    cy.get("input#confirmpassword").type("123");

    cy.get('button[type="submit"]').click();

    // Attendre un peu pour voir les erreurs
    cy.wait(3000);

    // Prendre une capture d'écran
    cy.screenshot("debug-password-short");

    // Afficher tout le contenu de la page
    cy.get("body").then(($body) => {
      console.log(
        "Contenu de la page après erreur mot de passe court:",
        $body.text()
      );
    });

    // Chercher tous les éléments qui pourraient contenir des erreurs
    cy.get("body").then(($body) => {
      const errorElements = $body.find(
        "[class*='error'], [class*='Error'], [class*='danger'], [class*='Danger']"
      );
      console.log("Éléments d'erreur trouvés:", errorElements.length);
      errorElements.each((index, element) => {
        console.log(`Erreur ${index}:`, element.textContent);
      });
    });
  });

  it("devrait afficher les vrais messages d'erreur pour email déjà utilisé", () => {
    cy.visit("/auth/register");

    // Test 3: Email déjà utilisé
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");

    cy.get('button[type="submit"]').click();

    // Attendre un peu pour voir les erreurs
    cy.wait(3000);

    // Prendre une capture d'écran
    cy.screenshot("debug-email-used");

    // Afficher tout le contenu de la page
    cy.get("body").then(($body) => {
      console.log(
        "Contenu de la page après erreur email utilisé:",
        $body.text()
      );
    });

    // Chercher tous les éléments qui pourraient contenir des erreurs
    cy.get("body").then(($body) => {
      const errorElements = $body.find(
        "[class*='error'], [class*='Error'], [class*='danger'], [class*='Danger']"
      );
      console.log("Éléments d'erreur trouvés:", errorElements.length);
      errorElements.each((index, element) => {
        console.log(`Erreur ${index}:`, element.textContent);
      });
    });
  });

  it("devrait afficher les vrais messages d'erreur pour champs vides", () => {
    cy.visit("/auth/register");

    // Test 4: Champs vides
    cy.get('button[type="submit"]').click();

    // Attendre un peu pour voir les erreurs
    cy.wait(3000);

    // Prendre une capture d'écran
    cy.screenshot("debug-empty-fields");

    // Afficher tout le contenu de la page
    cy.get("body").then(($body) => {
      console.log(
        "Contenu de la page après erreur champs vides:",
        $body.text()
      );
    });

    // Chercher tous les éléments qui pourraient contenir des erreurs
    cy.get("body").then(($body) => {
      const errorElements = $body.find(
        "[class*='error'], [class*='Error'], [class*='danger'], [class*='Danger']"
      );
      console.log("Éléments d'erreur trouvés:", errorElements.length);
      errorElements.each((index, element) => {
        console.log(`Erreur ${index}:`, element.textContent);
      });
    });
  });
});
