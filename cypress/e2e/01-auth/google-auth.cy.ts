import { authHelpers } from "../../support/helpers/auth.helpers";

describe("Authentification Google", () => {
  beforeEach(() => {
    // Nettoyer la base de données avant chaque test
    cy.cleanDatabase();
  });

  describe("Connexion Google", () => {
    it("devrait rediriger vers Google OAuth", () => {
      cy.visit("/auth/login");

      // Cliquer sur le bouton Google
      cy.get('[data-testid="google-login-button"]').click();

      // Vérifier la redirection vers Google
      cy.url().should("include", "/auth/google");
    });

    it("devrait afficher le bouton Google sur la page de connexion", () => {
      cy.visit("/auth/login");

      // Vérifier que le bouton Google est visible
      cy.get('[data-testid="google-login-button"]')
        .should("be.visible")
        .and("contain", "Se connecter avec Google");
    });

    it("devrait afficher le bouton Google sur la page d'inscription", () => {
      cy.visit("/auth/register");

      // Vérifier que le bouton Google est visible
      cy.get('[data-testid="google-signup-button"]')
        .should("be.visible")
        .and("contain", "S'inscrire avec Google");
    });
  });

  describe("Callback Google", () => {
    it("devrait traiter le callback Google avec succès", () => {
      // Simuler un callback Google réussi
      const mockGoogleUser = {
        id: "google-user-123",
        email: "google@example.com",
        name: "Google User",
        picture: "https://example.com/avatar.jpg",
      };

      // Intercepter la requête de callback
      cy.intercept("GET", "/api/auth/google/callback*", {
        statusCode: 200,
        body: {
          success: true,
          user: mockGoogleUser,
          hasOrganization: false,
        },
      }).as("googleCallback");

      // Visiter la page de callback
      cy.visit("/auth/google-callback?code=mock-code&state=mock-state");

      // Attendre le callback
      cy.wait("@googleCallback");

      // Vérifier la redirection vers la création d'organisation
      cy.url().should("include", "/create-organization");
    });

    it("devrait traiter le callback Google avec une organisation existante", () => {
      // Simuler un callback Google avec organisation
      const mockGoogleUser = {
        id: "google-user-123",
        email: "google@example.com",
        name: "Google User",
        picture: "https://example.com/avatar.jpg",
      };

      // Intercepter la requête de callback
      cy.intercept("GET", "/api/auth/google/callback*", {
        statusCode: 200,
        body: {
          success: true,
          user: mockGoogleUser,
          hasOrganization: true,
        },
      }).as("googleCallbackWithOrg");

      // Visiter la page de callback
      cy.visit("/auth/google-callback?code=mock-code&state=mock-state");

      // Attendre le callback
      cy.wait("@googleCallbackWithOrg");

      // Vérifier la redirection vers le dashboard
      cy.url().should("include", "/dashboard");
    });

    it("devrait gérer les erreurs de callback Google", () => {
      // Intercepter la requête de callback avec erreur
      cy.intercept("GET", "/api/auth/google/callback*", {
        statusCode: 400,
        body: {
          error: "Code d'autorisation invalide",
        },
      }).as("googleCallbackError");

      // Visiter la page de callback avec un code invalide
      cy.visit("/auth/google-callback?code=invalid-code&state=invalid-state");

      // Attendre le callback
      cy.wait("@googleCallbackError");

      // Vérifier la redirection vers la page de connexion avec erreur
      cy.url().should("include", "/auth/login");
      cy.contains("Erreur lors de la connexion Google").should("be.visible");
    });
  });

  describe("Gestion des utilisateurs Google existants", () => {
    it("devrait connecter un utilisateur Google existant", () => {
      // Créer un utilisateur Google existant
      cy.request("POST", "/api/auth/register", {
        email: "google@example.com",
        password: "dummy-password",
        firstname: "Google",
        lastname: "User",
        googleId: "google-user-123",
      });

      // Simuler le callback Google
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
          hasOrganization: false,
        },
      }).as("googleCallbackExisting");

      // Visiter la page de callback
      cy.visit("/auth/google-callback?code=mock-code&state=mock-state");

      // Attendre le callback
      cy.wait("@googleCallbackExisting");

      // Vérifier la redirection
      cy.url().should("include", "/create-organization");
    });

    it("devrait créer un nouvel utilisateur Google", () => {
      // Simuler le callback Google pour un nouvel utilisateur
      cy.intercept("GET", "/api/auth/google/callback*", {
        statusCode: 200,
        body: {
          success: true,
          user: {
            id: "new-google-user-456",
            email: "newgoogle@example.com",
            name: "New Google User",
            picture: "https://example.com/avatar.jpg",
          },
          hasOrganization: false,
        },
      }).as("googleCallbackNew");

      // Visiter la page de callback
      cy.visit("/auth/google-callback?code=mock-code&state=mock-state");

      // Attendre le callback
      cy.wait("@googleCallbackNew");

      // Vérifier la redirection vers la création d'organisation
      cy.url().should("include", "/create-organization");
    });
  });

  describe("Gestion des erreurs", () => {
    it("devrait gérer l'erreur d'accès refusé", () => {
      // Visiter la page de callback avec erreur d'accès refusé
      cy.visit("/auth/google-callback?error=access_denied");

      // Vérifier la redirection vers la page de connexion
      cy.url().should("include", "/auth/login");
      cy.contains("Connexion Google annulée").should("be.visible");
    });

    it("devrait gérer l'erreur de paramètres manquants", () => {
      // Visiter la page de callback sans paramètres
      cy.visit("/auth/google-callback");

      // Vérifier la redirection vers la page de connexion
      cy.url().should("include", "/auth/login");
      cy.contains("Erreur de paramètres Google").should("be.visible");
    });

    it("devrait gérer l'erreur de serveur", () => {
      // Intercepter la requête avec erreur serveur
      cy.intercept("GET", "/api/auth/google/callback*", {
        statusCode: 500,
        body: {
          error: "Erreur serveur interne",
        },
      }).as("googleCallbackServerError");

      // Visiter la page de callback
      cy.visit("/auth/google-callback?code=mock-code&state=mock-state");

      // Attendre le callback
      cy.wait("@googleCallbackServerError");

      // Vérifier la redirection vers la page de connexion
      cy.url().should("include", "/auth/login");
      cy.contains("Erreur serveur lors de la connexion Google").should(
        "be.visible"
      );
    });
  });

  describe("Interface utilisateur", () => {
    it("devrait afficher l'icône Google sur le bouton", () => {
      cy.visit("/auth/login");

      // Vérifier que l'icône Google est présente
      cy.get('[data-testid="google-login-button"]').find("svg").should("exist");
    });

    it("devrait avoir un design cohérent avec le thème", () => {
      cy.visit("/auth/login");

      // Vérifier les styles du bouton Google
      cy.get('[data-testid="google-login-button"]')
        .should("have.css", "background-color")
        .and("have.css", "color")
        .and("have.css", "border");
    });

    it("devrait être responsive", () => {
      // Test sur mobile
      cy.viewport(375, 667);
      cy.visit("/auth/login");

      cy.get('[data-testid="google-login-button"]')
        .should("be.visible")
        .and("be.usable");

      // Test sur tablette
      cy.viewport(768, 1024);
      cy.visit("/auth/login");

      cy.get('[data-testid="google-login-button"]')
        .should("be.visible")
        .and("be.usable");
    });
  });

  describe("Sécurité", () => {
    it("devrait valider le state parameter", () => {
      // Visiter la page de callback avec un state invalide
      cy.visit("/auth/google-callback?code=mock-code&state=invalid-state");

      // Vérifier la redirection vers la page de connexion
      cy.url().should("include", "/auth/login");
      cy.contains("Erreur de sécurité Google").should("be.visible");
    });

    it("devrait gérer les tentatives de CSRF", () => {
      // Simuler une tentative de CSRF
      cy.intercept("GET", "/api/auth/google/callback*", {
        statusCode: 403,
        body: {
          error: "Tentative de CSRF détectée",
        },
      }).as("csrfAttempt");

      // Visiter la page de callback
      cy.visit("/auth/google-callback?code=mock-code&state=mock-state");

      // Attendre la réponse
      cy.wait("@csrfAttempt");

      // Vérifier la redirection
      cy.url().should("include", "/auth/login");
      cy.contains("Erreur de sécurité").should("be.visible");
    });
  });

  describe("Accessibilité", () => {
    it("devrait avoir des attributs ARIA appropriés", () => {
      cy.visit("/auth/login");

      // Vérifier les attributs ARIA
      cy.get('[data-testid="google-login-button"]')
        .should("have.attr", "aria-label", "Se connecter avec Google")
        .and("have.attr", "role", "button");
    });

    it("devrait supporter la navigation au clavier", () => {
      cy.visit("/auth/login");

      // Naviguer avec Tab
      cy.get('[data-testid="google-login-button"]').focus();

      // Vérifier que le bouton est focusable
      cy.get('[data-testid="google-login-button"]').should("be.focused");

      // Activer avec Enter
      cy.get('[data-testid="google-login-button"]').type("{enter}");

      // Vérifier la redirection
      cy.url().should("include", "/auth/google");
    });
  });

  describe("Performance", () => {
    it("devrait charger rapidement", () => {
      const startTime = Date.now();

      cy.visit("/auth/login");

      cy.get('[data-testid="google-login-button"]')
        .should("be.visible")
        .then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(2000); // Moins de 2 secondes
        });
    });

    it("devrait gérer les timeouts de connexion", () => {
      // Intercepter la requête avec timeout
      cy.intercept("GET", "/api/auth/google/callback*", {
        statusCode: 408,
        body: {
          error: "Timeout de connexion",
        },
      }).as("googleTimeout");

      // Visiter la page de callback
      cy.visit("/auth/google-callback?code=mock-code&state=mock-state");

      // Attendre le timeout
      cy.wait("@googleTimeout");

      // Vérifier la gestion du timeout
      cy.url().should("include", "/auth/login");
      cy.contains("Timeout de connexion Google").should("be.visible");
    });
  });
});
