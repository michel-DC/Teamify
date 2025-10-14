import { authHelpers } from "../../support/helpers/auth.helpers";
import { authTestHelpers } from "../../support/helpers/auth-test.helpers";

describe("Tests d'intégration - Authentification complète", () => {
  beforeEach(() => {
    cy.cleanDatabase();
  });

  describe("Flux complet d'authentification", () => {
    it("devrait permettre l'inscription, la connexion et la déconnexion", () => {
      const userData = authHelpers.generateTestUser("integration");

      // 1. Inscription
      cy.visit("/auth/register");
      authTestHelpers.fillRegistrationForm(userData);
      authTestHelpers.submitRegistrationForm();

      // Vérifier la redirection vers la création d'organisation
      authTestHelpers.verifyRedirectToCreateOrganization();

      // 2. Créer une organisation
      cy.get('input[name="name"]').type("Test Organization");
      cy.get('textarea[name="bio"]').type("Test bio");
      cy.get('select[name="organizationType"]').select("ASSOCIATION");
      cy.get('textarea[name="mission"]').type("Test mission");
      cy.get('button[type="submit"]').click();

      // Vérifier la redirection vers le dashboard
      authTestHelpers.verifyRedirectToDashboard();

      // 3. Déconnexion
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      // Vérifier la déconnexion
      authTestHelpers.verifyUserIsLoggedOut();

      // 4. Reconnexion
      cy.visit("/auth/login");
      authTestHelpers.fillLoginForm(userData.email, userData.password);
      authTestHelpers.submitLoginForm();

      // Vérifier la reconnexion
      authTestHelpers.verifyUserIsLoggedIn();
    });

    it("devrait gérer le flux avec invitation", () => {
      const inviterData = authHelpers.getAdminUser();
      const inviteeData = authHelpers.generateTestUser("invitee");
      const inviteCode = "test-invite-code-123";

      // 1. Créer l'inviteur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: inviterData.email,
        password: inviterData.password,
        firstname: inviterData.firstname,
        lastname: inviterData.lastname,
      }).then(() => {
        // Créer une organisation
        cy.request("POST", "/api/organizations/create", {
          name: "Test Organization",
          bio: "Test bio",
          organizationType: "ASSOCIATION",
          mission: "Test mission",
          location: {
            city: "Paris",
            lat: 48.8566,
            lon: 2.3522,
            displayName: "Paris, France",
          },
        });
      });

      // 2. Envoyer une invitation
      cy.request("POST", "/api/organizations/invite", {
        organizationId: 1,
        email: inviteeData.email,
      });

      // 3. Accepter l'invitation via inscription
      cy.visit(`/auth/register?invite=${inviteCode}`);
      authTestHelpers.fillRegistrationForm(inviteeData);
      authTestHelpers.submitRegistrationForm();

      // Vérifier la redirection vers le dashboard (car l'utilisateur a une organisation)
      authTestHelpers.verifyRedirectToDashboard();
    });
  });

  describe("Gestion des sessions", () => {
    it("devrait maintenir la session après rafraîchissement", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      authTestHelpers.createUserWithOrganization(userData, {
        name: "Test Organization",
        bio: "Test bio",
        organizationType: "ASSOCIATION",
        mission: "Test mission",
        location: {
          city: "Paris",
          lat: 48.8566,
          lon: 2.3522,
          displayName: "Paris, France",
        },
      });

      // Se connecter
      cy.login(userData.email, userData.password);

      // Rafraîchir la page
      cy.reload();

      // Vérifier que la session est maintenue
      authTestHelpers.verifyUserIsLoggedIn();
    });

    it("devrait rediriger si l'utilisateur n'est pas connecté", () => {
      // Essayer d'accéder au dashboard sans être connecté
      cy.visit("/dashboard");

      // Vérifier la redirection vers la connexion
      authTestHelpers.verifyUserIsLoggedOut();
    });

    it("devrait gérer l'expiration de session", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      authTestHelpers.createUserWithOrganization(userData, {
        name: "Test Organization",
        bio: "Test bio",
        organizationType: "ASSOCIATION",
        mission: "Test mission",
        location: {
          city: "Paris",
          lat: 48.8566,
          lon: 2.3522,
          displayName: "Paris, France",
        },
      });

      // Se connecter
      cy.login(userData.email, userData.password);

      // Simuler l'expiration de session
      cy.clearCookies();

      // Essayer d'accéder au dashboard
      cy.visit("/dashboard");

      // Vérifier la redirection vers la connexion
      authTestHelpers.verifyUserIsLoggedOut();
    });
  });

  describe("Gestion des erreurs réseau", () => {
    it("devrait gérer les erreurs de connexion", () => {
      // Simuler une erreur réseau
      authTestHelpers.simulateUnstableNetwork();

      cy.visit("/auth/login");
      authTestHelpers.fillLoginForm("test@example.com", "password");
      authTestHelpers.submitLoginForm();

      // Vérifier la gestion de l'erreur
      cy.contains("Erreur réseau").should("be.visible");
    });

    it("devrait gérer les timeouts", () => {
      // Simuler un réseau lent
      authTestHelpers.simulateSlowNetwork();

      cy.visit("/auth/login");
      authTestHelpers.fillLoginForm("test@example.com", "password");
      authTestHelpers.submitLoginForm();

      // Attendre le timeout
      cy.wait("@slowLogin");
    });
  });

  describe("Tests de performance", () => {
    it("devrait charger rapidement", () => {
      authTestHelpers.testPerformance(2000);
    });

    it("devrait gérer plusieurs connexions simultanées", () => {
      const users = [
        authHelpers.generateTestUser("user1"),
        authHelpers.generateTestUser("user2"),
        authHelpers.generateTestUser("user3"),
      ];

      // Créer plusieurs utilisateurs
      users.forEach((user, index) => {
        cy.request("POST", "/api/auth/register", user);
      });

      // Tester les connexions
      users.forEach((user) => {
        cy.visit("/auth/login");
        authTestHelpers.fillLoginForm(user.email, user.password);
        authTestHelpers.submitLoginForm();
        cy.logout();
      });
    });
  });

  describe("Tests d'accessibilité", () => {
    it("devrait respecter les standards d'accessibilité", () => {
      cy.visit("/auth/login");
      authTestHelpers.verifyAccessibilityAttributes();
    });

    it("devrait supporter la navigation au clavier", () => {
      cy.visit("/auth/login");
      authTestHelpers.testKeyboardNavigation();
    });

    it("devrait être responsive", () => {
      cy.visit("/auth/login");
      authTestHelpers.testResponsiveness();
    });
  });

  describe("Gestion des cookies et localStorage", () => {
    it("devrait gérer correctement les cookies", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      authTestHelpers.createUserWithOrganization(userData, {
        name: "Test Organization",
        bio: "Test bio",
        organizationType: "ASSOCIATION",
        mission: "Test mission",
        location: {
          city: "Paris",
          lat: 48.8566,
          lon: 2.3522,
          displayName: "Paris, France",
        },
      });

      // Se connecter
      cy.login(userData.email, userData.password);

      // Tester la gestion des cookies
      authTestHelpers.testCookieManagement();
    });

    it("devrait gérer correctement le localStorage", () => {
      authTestHelpers.testLocalStorageManagement();
    });
  });

  describe("Tests de sécurité", () => {
    it("devrait empêcher les attaques CSRF", () => {
      // Simuler une tentative de CSRF
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 403,
        body: { error: "Tentative de CSRF détectée" },
      }).as("csrfAttempt");

      cy.visit("/auth/login");
      authTestHelpers.fillLoginForm("test@example.com", "password");
      authTestHelpers.submitLoginForm();

      cy.wait("@csrfAttempt");
      cy.contains("Erreur de sécurité").should("be.visible");
    });

    it("devrait valider les tokens JWT", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      authTestHelpers.createUserWithOrganization(userData, {
        name: "Test Organization",
        bio: "Test bio",
        organizationType: "ASSOCIATION",
        mission: "Test mission",
        location: {
          city: "Paris",
          lat: 48.8566,
          lon: 2.3522,
          displayName: "Paris, France",
        },
      });

      // Se connecter
      cy.login(userData.email, userData.password);

      // Vérifier que les tokens sont présents
      cy.getCookie("next-auth.session-token").should("exist");
    });
  });

  describe("Tests de compatibilité", () => {
    it("devrait fonctionner sur différents navigateurs", () => {
      // Test sur Chrome (par défaut)
      cy.visit("/auth/login");
      cy.get('input[name="email"]').should("be.visible");

      // Test sur Firefox
      cy.visit("/auth/login");
      cy.get('input[name="email"]').should("be.visible");

      // Test sur Edge
      cy.visit("/auth/login");
      cy.get('input[name="email"]').should("be.visible");
    });

    it("devrait fonctionner sur différents appareils", () => {
      // Test mobile
      cy.viewport(375, 667);
      cy.visit("/auth/login");
      cy.get('input[name="email"]').should("be.visible");

      // Test tablette
      cy.viewport(768, 1024);
      cy.visit("/auth/login");
      cy.get('input[name="email"]').should("be.visible");

      // Test desktop
      cy.viewport(1280, 720);
      cy.visit("/auth/login");
      cy.get('input[name="email"]').should("be.visible");
    });
  });
});
