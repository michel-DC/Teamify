/// <reference types="cypress" />

// Commandes personnalisées Cypress

// Déclaration des commandes personnalisées Cypress
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Commande pour se connecter avec email et mot de passe
       * @param email - Email de l'utilisateur
       * @param password - Mot de passe
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Commande pour se déconnecter
       */
      logout(): Chainable<void>;

      /**
       * Commande pour créer une organisation via l'API
       * @param orgData - Données de l'organisation
       */
      createOrganization(orgData: any): Chainable<any>;

      /**
       * Commande pour créer un événement via l'API
       * @param eventData - Données de l'événement
       */
      createEvent(eventData: any): Chainable<any>;

      /**
       * Commande pour uploader un fichier
       * @param selector - Sélecteur de l'input file
       * @param fileName - Nom du fichier à uploader
       */
      uploadFile(selector: string, fileName: string): Chainable<void>;

      /**
       * Commande pour vérifier l'affichage d'un toast
       * @param message - Message du toast à vérifier
       */
      verifyToast(message: string): Chainable<void>;

      /**
       * Commande pour attendre qu'une requête API soit terminée
       * @param method - Méthode HTTP
       * @param url - URL de l'API
       */
      waitForApi(method: string, url: string): Chainable<void>;

      /**
       * Commande pour nettoyer la base de données de test
       */
      cleanDatabase(): Chainable<void>;
    }
  }
}

// Les plugins ont été supprimés pour éviter les erreurs de compilation

// Commandes personnalisées
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/auth/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("include", "/dashboard");
});

Cypress.Commands.add("logout", () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should("include", "/auth/login");
});

Cypress.Commands.add("createOrganization", (orgData) => {
  return cy.request({
    method: "POST",
    url: "/api/organizations/create",
    body: orgData,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("createEvent", (eventData) => {
  return cy.request({
    method: "POST",
    url: "/api/dashboard/events",
    body: eventData,
    failOnStatusCode: false,
  });
});

// Commande uploadFile supprimée (dépendait de cypress-file-upload)
// Utilisez cy.get('input[type="file"]').selectFile() à la place

Cypress.Commands.add("verifyToast", (message: string) => {
  cy.contains(message).should("be.visible");
});

Cypress.Commands.add("waitForApi", (method: string, url: string) => {
  cy.intercept(method, url).as("apiCall");
  cy.wait("@apiCall");
});

Cypress.Commands.add("cleanDatabase", () => {
  // Cette commande sera implémentée selon votre stratégie de nettoyage
  // Par exemple, appeler un endpoint de reset ou utiliser des transactions
  cy.log("Nettoyage de la base de données de test");
});
