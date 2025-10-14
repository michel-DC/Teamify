// Test de débogage pour diagnostiquer les problèmes
describe("Debug - Diagnostic des tests", () => {
  it("devrait charger la page d'accueil", () => {
    cy.visit("/");

    // Attendre que la page se charge
    cy.wait(2000);

    // Vérifier que la page contient quelque chose
    cy.get("body").should("exist");

    // Prendre une capture d'écran pour voir ce qui se passe
    cy.screenshot("homepage-debug");
  });

  it("devrait charger la page de connexion", () => {
    cy.visit("/auth/login");

    // Attendre que la page se charge
    cy.wait(2000);

    // Vérifier que la page contient quelque chose
    cy.get("body").should("exist");

    // Prendre une capture d'écran pour voir ce qui se passe
    cy.screenshot("login-page-debug");

    // Afficher le contenu de la page dans la console
    cy.get("body").then(($body) => {
      console.log("Contenu de la page:", $body.text());
    });
  });

  it("devrait charger la page d'inscription", () => {
    cy.visit("/auth/register");

    // Attendre que la page se charge
    cy.wait(2000);

    // Vérifier que la page contient quelque chose
    cy.get("body").should("exist");

    // Prendre une capture d'écran pour voir ce qui se passe
    cy.screenshot("register-page-debug");

    // Afficher le contenu de la page dans la console
    cy.get("body").then(($body) => {
      console.log("Contenu de la page d'inscription:", $body.text());
    });
  });

  it("devrait vérifier que l'application est démarrée", () => {
    // Vérifier que l'application répond
    cy.request("GET", "/").then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
