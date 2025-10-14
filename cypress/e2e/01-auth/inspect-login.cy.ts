// Test pour inspecter la structure réelle de la page de connexion
describe("Inspection de la page de connexion", () => {
  it("devrait inspecter tous les éléments de la page de connexion", () => {
    cy.visit("/auth/login");

    // Attendre que la page se charge
    cy.wait(3000);

    // Prendre une capture d'écran
    cy.screenshot("login-page-inspection");

    // Afficher le HTML complet de la page
    cy.get("body").then(($body) => {
      console.log("HTML complet de la page de connexion:", $body.html());
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
  });
});
