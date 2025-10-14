// Import commands.js using ES2015 syntax:
import "./commands";

// Configuration globale pour les tests
beforeEach(() => {
  // Nettoyer les cookies et le localStorage avant chaque test
  cy.clearCookies();
  cy.clearLocalStorage();
});

// Configuration pour les requêtes API
Cypress.on("uncaught:exception", (err, runnable) => {
  // Empêcher Cypress de s'arrêter sur les erreurs non gérées
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }
  return true;
});
