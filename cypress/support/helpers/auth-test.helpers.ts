// Helpers spécifiques pour les tests d'authentification
import { authHelpers } from "./auth.helpers";

export const authTestHelpers = {
  /**
   * Crée un utilisateur de test via l'API
   */
  createTestUser: (userData: any) => {
    return cy.request({
      method: "POST",
      url: "/api/auth/register",
      body: userData,
      failOnStatusCode: false,
    });
  },

  /**
   * Crée un utilisateur avec organisation
   */
  createUserWithOrganization: (userData: any, orgData: any) => {
    return cy
      .request({
        method: "POST",
        url: "/api/auth/register",
        body: userData,
        failOnStatusCode: false,
      })
      .then(() => {
        return cy.request({
          method: "POST",
          url: "/api/organizations/create",
          body: orgData,
          failOnStatusCode: false,
        });
      });
  },

  /**
   * Simule une connexion réussie
   */
  simulateSuccessfulLogin: (email: string, password: string) => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: {
        success: true,
        user: {
          uid: "test-uid",
          email,
          firstname: "Test",
          lastname: "User",
        },
        hasOrganization: false,
      },
    }).as("successfulLogin");
  },

  /**
   * Simule une connexion échouée
   */
  simulateFailedLogin: (
    errorMessage: string = "Email ou mot de passe incorrect"
  ) => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 401,
      body: {
        error: errorMessage,
      },
    }).as("failedLogin");
  },

  /**
   * Simule une inscription réussie
   */
  simulateSuccessfulRegistration: (userData: any) => {
    cy.intercept("POST", "/api/auth/register", {
      statusCode: 201,
      body: {
        message: "Compte créé !",
        user: {
          uid: "new-user-uid",
          email: userData.email,
          firstname: userData.firstname,
          lastname: userData.lastname,
        },
        hasInvitation: false,
        hasOrganization: false,
      },
    }).as("successfulRegistration");
  },

  /**
   * Simule une inscription échouée
   */
  simulateFailedRegistration: (
    errorMessage: string = "Cet email est déjà utilisé"
  ) => {
    cy.intercept("POST", "/api/auth/register", {
      statusCode: 400,
      body: {
        error: errorMessage,
      },
    }).as("failedRegistration");
  },

  /**
   * Simule un callback Google réussi
   */
  simulateGoogleCallback: (hasOrganization: boolean = false) => {
    cy.intercept("GET", "/api/auth/google/callback*", {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: "google-user-123",
          email: "google@example.com",
          name: "Google User",
          picture: "https://example.com/avatar.jpg",
        },
        hasOrganization,
      },
    }).as("googleCallback");
  },

  /**
   * Simule un callback Google échoué
   */
  simulateGoogleCallbackError: (
    errorMessage: string = "Code d'autorisation invalide"
  ) => {
    cy.intercept("GET", "/api/auth/google/callback*", {
      statusCode: 400,
      body: {
        error: errorMessage,
      },
    }).as("googleCallbackError");
  },

  /**
   * Vérifie qu'un utilisateur est connecté
   */
  verifyUserIsLoggedIn: () => {
    cy.url().should("include", "/dashboard");
    cy.contains("Tableau de bord").should("be.visible");
  },

  /**
   * Vérifie qu'un utilisateur est déconnecté
   */
  verifyUserIsLoggedOut: () => {
    cy.url().should("include", "/auth/login");
    cy.contains("Je me connecte").should("be.visible");
  },

  /**
   * Vérifie la redirection vers la création d'organisation
   */
  verifyRedirectToCreateOrganization: () => {
    cy.url().should("include", "/create-organization");
    cy.contains("Créer votre première organisation").should("be.visible");
  },

  /**
   * Vérifie la redirection vers le dashboard
   */
  verifyRedirectToDashboard: () => {
    cy.url().should("include", "/dashboard");
    cy.contains("Tableau de bord").should("be.visible");
  },

  /**
   * Remplit le formulaire de connexion
   */
  fillLoginForm: (email: string, password: string) => {
    cy.get('input[name="email"]').clear().type(email);
    cy.get('input[name="password"]').clear().type(password);
  },

  /**
   * Remplit le formulaire d'inscription
   */
  fillRegistrationForm: (userData: any) => {
    cy.get('input[name="firstname"]').clear().type(userData.firstname);
    cy.get('input[name="lastname"]').clear().type(userData.lastname);
    cy.get('input[name="email"]').clear().type(userData.email);
    cy.get('input[name="password"]').clear().type(userData.password);
    cy.get('input[name="confirmPassword"]').clear().type(userData.password);
  },

  /**
   * Soumet le formulaire de connexion
   */
  submitLoginForm: () => {
    cy.get('button[type="submit"]').click();
  },

  /**
   * Soumet le formulaire d'inscription
   */
  submitRegistrationForm: () => {
    cy.get('button[type="submit"]').click();
  },

  /**
   * Vérifie les messages d'erreur de validation
   */
  verifyValidationErrors: (errors: string[]) => {
    errors.forEach((error) => {
      cy.contains(error).should("be.visible");
    });
  },

  /**
   * Vérifie les messages de succès
   */
  verifySuccessMessages: (messages: string[]) => {
    messages.forEach((message) => {
      cy.verifyToast(message);
    });
  },

  /**
   * Vérifie les attributs d'accessibilité
   */
  verifyAccessibilityAttributes: () => {
    // Vérifier les labels
    cy.get('label[for="email"]').should("exist");
    cy.get('label[for="password"]').should("exist");

    // Vérifier les attributs ARIA
    cy.get('input[name="email"]').should("have.attr", "aria-required", "true");
    cy.get('input[name="password"]').should(
      "have.attr",
      "aria-required",
      "true"
    );

    // Vérifier les rôles
    cy.get('button[type="submit"]').should("have.attr", "role", "button");
  },

  /**
   * Teste la navigation au clavier
   */
  testKeyboardNavigation: () => {
    // Tab navigation
    cy.get('input[name="email"]').focus();
    cy.get('input[name="email"]').type("test@example.com");

    cy.get('input[name="password"]').focus();
    cy.get('input[name="password"]').type("password");

    cy.get('button[type="submit"]').focus();
    cy.get('button[type="submit"]').type("{enter}");
  },

  /**
   * Teste la responsivité
   */
  testResponsiveness: () => {
    // Test mobile
    cy.viewport(375, 667);
    cy.get('input[name="email"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");

    // Test tablette
    cy.viewport(768, 1024);
    cy.get('input[name="email"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");

    // Test desktop
    cy.viewport(1280, 720);
    cy.get('input[name="email"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  },

  /**
   * Teste les performances
   */
  testPerformance: (maxLoadTime: number = 3000) => {
    const startTime = Date.now();

    cy.visit("/auth/login");

    cy.get('input[name="email"]')
      .should("be.visible")
      .then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(maxLoadTime);
      });
  },

  /**
   * Simule des conditions de réseau lentes
   */
  simulateSlowNetwork: () => {
    cy.intercept("POST", "/api/auth/login", (req) => {
      req.reply((res) => {
        setTimeout(() => {
          res.send({
            statusCode: 200,
            body: { success: true },
          });
        }, 2000);
      });
    }).as("slowLogin");
  },

  /**
   * Simule des conditions de réseau instables
   */
  simulateUnstableNetwork: () => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 500,
      body: { error: "Erreur réseau" },
    }).as("unstableNetwork");
  },

  /**
   * Teste la gestion des cookies
   */
  testCookieManagement: () => {
    // Vérifier que les cookies sont présents après connexion
    cy.getCookie("isLoggedIn").should("exist");
    cy.getCookie("hasOrganization").should("exist");

    // Vérifier que les cookies sont supprimés après déconnexion
    cy.clearCookies();
    cy.getCookie("isLoggedIn").should("not.exist");
    cy.getCookie("hasOrganization").should("not.exist");
  },

  /**
   * Teste la gestion du localStorage
   */
  testLocalStorageManagement: () => {
    // Ajouter des données au localStorage
    cy.window().then((win) => {
      win.localStorage.setItem("testData", "testValue");
    });

    // Vérifier que les données sont présentes
    cy.window().then((win) => {
      expect(win.localStorage.getItem("testData")).to.equal("testValue");
    });

    // Nettoyer le localStorage
    cy.clearLocalStorage();

    // Vérifier que les données sont supprimées
    cy.window().then((win) => {
      expect(win.localStorage.getItem("testData")).to.be.null;
    });
  },
};
