// Test pour inspecter la structure réelle de la page d'inscription
describe("Inspection de la page d'inscription", () => {
  it("devrait inspecter tous les éléments de la page d'inscription", () => {
    cy.visit("/auth/register");

    // Attendre que la page se charge
    cy.wait(3000);

    // Prendre une capture d'écran
    cy.screenshot("register-page-inspection");

    // Afficher le HTML complet de la page
    cy.get("body").then(($body) => {
      console.log("HTML complet de la page:", $body.html());
    });

    // Lister tous les inputs sur la page
    cy.get("input").then(($inputs) => {
      console.log("Nombre d'inputs trouvés:", $inputs.length);
      $inputs.each((index, input) => {
        console.log(`Input ${index}:`, {
          name: input.name,
          type: input.type,
          placeholder: input.placeholder,
          id: input.id,
          className: input.className,
        });
      });
    });

    // Lister tous les boutons
    cy.get("button").then(($buttons) => {
      console.log("Nombre de boutons trouvés:", $buttons.length);
      $buttons.each((index, button) => {
        console.log(`Bouton ${index}:`, {
          text: button.textContent,
          type: button.type,
          className: button.className,
        });
      });
    });

    // Lister tous les textes visibles
    cy.get("body").then(($body) => {
      const text = $body.text();
      console.log("Tous les textes visibles:", text);
    });

    // Chercher des patterns de texte courants
    const commonTexts = [
      "inscription",
      "register",
      "sign up",
      "créer",
      "compte",
      "account",
      "prénom",
      "firstname",
      "nom",
      "lastname",
      "email",
      "password",
      "mot de passe",
    ];

    commonTexts.forEach((text) => {
      cy.get("body").then(($body) => {
        if ($body.text().toLowerCase().includes(text.toLowerCase())) {
          console.log(`Texte trouvé: "${text}"`);
        }
      });
    });
  });
});
