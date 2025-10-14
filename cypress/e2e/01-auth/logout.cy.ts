import { authHelpers } from "../../support/helpers/auth.helpers";

describe("Déconnexion utilisateur", () => {
  beforeEach(() => {
    // Nettoyer la base de données avant chaque test
    cy.cleanDatabase();
  });

  describe("Déconnexion depuis le dashboard", () => {
    it("devrait permettre la déconnexion depuis le menu utilisateur", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Vérifier que l'utilisateur est connecté
      cy.url().should("include", "/dashboard");
      cy.contains("Tableau de bord").should("be.visible");

      // Cliquer sur le menu utilisateur
      cy.get('[data-testid="user-menu"]').click();

      // Vérifier que le menu est ouvert
      cy.get('[data-testid="user-menu-dropdown"]').should("be.visible");

      // Cliquer sur "Se déconnecter"
      cy.get('[data-testid="logout-button"]').click();

      // Vérifier la redirection vers la page de connexion
      cy.url().should("include", "/auth/login");

      // Vérifier que l'utilisateur est déconnecté
      cy.contains("Je me connecte").should("be.visible");
    });

    it("devrait permettre la déconnexion depuis la sidebar", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Cliquer sur le bouton de déconnexion dans la sidebar
      cy.get('[data-testid="sidebar-logout-button"]').click();

      // Vérifier la redirection vers la page de connexion
      cy.url().should("include", "/auth/login");
    });
  });

  describe("Déconnexion automatique", () => {
    it("devrait rediriger vers la connexion si l'utilisateur n'est pas authentifié", () => {
      // Essayer d'accéder au dashboard sans être connecté
      cy.visit("/dashboard");

      // Vérifier la redirection automatique
      cy.url().should("include", "/auth/login");
    });

    it("devrait rediriger vers la connexion si la session a expiré", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Simuler l'expiration de la session en supprimant les cookies
      cy.clearCookies();

      // Essayer d'accéder à une page protégée
      cy.visit("/dashboard");

      // Vérifier la redirection vers la connexion
      cy.url().should("include", "/auth/login");
    });
  });

  describe("Nettoyage après déconnexion", () => {
    it("devrait nettoyer les cookies et le localStorage", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Vérifier que des cookies sont présents
      cy.getCookie("isLoggedIn").should("exist");
      cy.getCookie("hasOrganization").should("exist");

      // Se déconnecter
      cy.logout();

      // Vérifier que les cookies sont supprimés
      cy.getCookie("isLoggedIn").should("not.exist");
      cy.getCookie("hasOrganization").should("not.exist");
    });

    it("devrait nettoyer le localStorage", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Ajouter des données au localStorage
      cy.window().then((win) => {
        win.localStorage.setItem("testData", "testValue");
        win.localStorage.setItem("userPreferences", "preferences");
      });

      // Se déconnecter
      cy.logout();

      // Vérifier que le localStorage est nettoyé
      cy.window().then((win) => {
        expect(win.localStorage.getItem("testData")).to.be.null;
        expect(win.localStorage.getItem("userPreferences")).to.be.null;
      });
    });
  });

  describe("Redirection après déconnexion", () => {
    it("devrait rediriger vers la page de connexion par défaut", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Se déconnecter
      cy.logout();

      // Vérifier la redirection vers la page de connexion
      cy.url().should("include", "/auth/login");
      cy.contains("Je me connecte").should("be.visible");
    });

    it("devrait afficher un message de confirmation", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Se déconnecter
      cy.logout();

      // Vérifier le message de confirmation
      cy.verifyToast("Vous avez été déconnecté avec succès");
    });
  });

  describe("Gestion des erreurs", () => {
    it("devrait gérer les erreurs de déconnexion", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Intercepter la requête de déconnexion et simuler une erreur
      cy.intercept("POST", "/api/auth/logout", {
        statusCode: 500,
        body: { error: "Erreur serveur" },
      }).as("logoutError");

      // Essayer de se déconnecter
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      // Attendre la réponse d'erreur
      cy.wait("@logoutError");

      // Vérifier que l'utilisateur est quand même déconnecté côté client
      cy.url().should("include", "/auth/login");
    });
  });

  describe("Accessibilité", () => {
    it("devrait avoir des attributs ARIA appropriés pour le bouton de déconnexion", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Vérifier les attributs ARIA
      cy.get('[data-testid="logout-button"]').should("have.attr", "aria-label");
      cy.get('[data-testid="logout-button"]').should(
        "have.attr",
        "role",
        "button"
      );
    });

    it("devrait supporter la navigation au clavier", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      // Se connecter
      cy.login(userData.email, userData.password);

      // Naviguer avec Tab
      cy.get('[data-testid="user-menu"]').focus();
      cy.get('[data-testid="user-menu"]').type("{enter}");

      // Vérifier que le menu est ouvert
      cy.get('[data-testid="user-menu-dropdown"]').should("be.visible");

      // Naviguer vers le bouton de déconnexion
      cy.get('[data-testid="logout-button"]').focus();
      cy.get('[data-testid="logout-button"]').type("{enter}");

      // Vérifier la déconnexion
      cy.url().should("include", "/auth/login");
    });
  });

  describe("Responsive design", () => {
    it("devrait fonctionner sur mobile", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
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

      cy.viewport(375, 667); // iPhone SE

      // Se connecter
      cy.login(userData.email, userData.password);

      // Vérifier que le bouton de déconnexion est visible
      cy.get('[data-testid="user-menu"]').should("be.visible");

      // Se déconnecter
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      // Vérifier la déconnexion
      cy.url().should("include", "/auth/login");
    });
  });
});
