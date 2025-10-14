import { authHelpers } from "../../support/helpers/auth.helpers";

describe("Connexion utilisateur", () => {
  beforeEach(() => {
    // Nettoyer la base de données avant chaque test
    cy.cleanDatabase();
  });

  describe("Connexion avec identifiants valides", () => {
    it("devrait permettre la connexion d'un utilisateur existant", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur via l'API
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
      });

      cy.visit("/auth/login");

      // Vérifier que la page est chargée
      cy.contains("Je me connecte").should("be.visible");

      // Remplir le formulaire de connexion
      cy.get('input[name="email"]').type(userData.email);
      cy.get('input[name="password"]').type(userData.password);

      // Soumettre le formulaire
      cy.get('button[type="submit"]').click();

      // Vérifier la redirection vers le dashboard
      cy.url().should("include", "/dashboard");

      // Vérifier le message de bienvenue
      cy.verifyToast(`Ravi de vous revoir ${userData.firstname}`);
    });

    it("devrait rediriger vers la création d'organisation si l'utilisateur n'a pas d'organisation", () => {
      const userData = authHelpers.generateTestUser("noorg");

      // Créer un utilisateur sans organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
      });

      cy.visit("/auth/login");

      // Se connecter
      cy.get('input[name="email"]').type(userData.email);
      cy.get('input[name="password"]').type(userData.password);
      cy.get('button[type="submit"]').click();

      // Vérifier la redirection vers la création d'organisation
      cy.url().should("include", "/create-organization");
    });

    it("devrait rediriger vers le dashboard si l'utilisateur a une organisation", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
      }).then((response) => {
        // Créer une organisation pour cet utilisateur
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

      cy.visit("/auth/login");

      // Se connecter
      cy.get('input[name="email"]').type(userData.email);
      cy.get('input[name="password"]').type(userData.password);
      cy.get('button[type="submit"]').click();

      // Vérifier la redirection vers le dashboard
      cy.url().should("include", "/dashboard");
    });
  });

  describe("Validation des identifiants", () => {
    it("devrait afficher une erreur pour des identifiants invalides", () => {
      cy.visit("/auth/login");

      // Essayer de se connecter avec des identifiants invalides
      cy.get('input[name="email"]').type("invalid@example.com");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      // Vérifier le message d'erreur
      cy.contains("Email ou mot de passe incorrect").should("be.visible");
    });

    it("devrait afficher une erreur si l'email n'existe pas", () => {
      cy.visit("/auth/login");

      // Essayer de se connecter avec un email inexistant
      cy.get('input[name="email"]').type("nonexistent@example.com");
      cy.get('input[name="password"]').type("anypassword");
      cy.get('button[type="submit"]').click();

      // Vérifier le message d'erreur
      cy.contains("Email ou mot de passe incorrect").should("be.visible");
    });

    it("devrait afficher une erreur si le mot de passe est incorrect", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
      });

      cy.visit("/auth/login");

      // Essayer de se connecter avec un mauvais mot de passe
      cy.get('input[name="email"]').type(userData.email);
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      // Vérifier le message d'erreur
      cy.contains("Email ou mot de passe incorrect").should("be.visible");
    });

    it("devrait afficher une erreur si l'email n'est pas valide", () => {
      cy.visit("/auth/login");

      // Essayer de se connecter avec un email invalide
      cy.get('input[name="email"]').type("email-invalide");
      cy.get('input[name="password"]').type("anypassword");
      cy.get('button[type="submit"]').click();

      // Vérifier le message d'erreur
      cy.contains("Format d'email invalide").should("be.visible");
    });

    it("devrait afficher une erreur si les champs sont vides", () => {
      cy.visit("/auth/login");

      // Essayer de soumettre sans remplir
      cy.get('button[type="submit"]').click();

      // Vérifier les messages d'erreur
      cy.contains("L'email est requis").should("be.visible");
      cy.contains("Le mot de passe est requis").should("be.visible");
    });
  });

  describe("Navigation et liens", () => {
    it("devrait rediriger vers la page d'inscription", () => {
      cy.visit("/auth/login");

      // Cliquer sur le lien "Créer un compte"
      cy.contains("Créer un compte").click();

      // Vérifier la redirection
      cy.url().should("include", "/auth/register");
    });

    it("devrait rediriger vers la page de mot de passe oublié", () => {
      cy.visit("/auth/login");

      // Cliquer sur le lien "Mot de passe oublié"
      cy.contains("Mot de passe oublié").click();

      // Vérifier la redirection
      cy.url().should("include", "/auth/forgot");
    });

    it("devrait rediriger vers la connexion Google", () => {
      cy.visit("/auth/login");

      // Cliquer sur le bouton Google
      cy.get('[data-testid="google-login-button"]').click();

      // Vérifier la redirection vers Google
      cy.url().should("include", "/auth/google");
    });
  });

  describe("Persistance de session", () => {
    it("devrait maintenir la session après un rafraîchissement", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
      });

      // Se connecter
      cy.login(userData.email, userData.password);

      // Rafraîchir la page
      cy.reload();

      // Vérifier que l'utilisateur est toujours connecté
      cy.url().should("include", "/dashboard");
      cy.contains("Tableau de bord").should("be.visible");
    });

    it("devrait rediriger vers le dashboard si l'utilisateur est déjà connecté", () => {
      const userData = authHelpers.getAdminUser();

      // Créer un utilisateur avec organisation
      cy.request("POST", "/api/auth/register", {
        email: userData.email,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
      });

      // Se connecter
      cy.login(userData.email, userData.password);

      // Essayer d'accéder à la page de connexion
      cy.visit("/auth/login");

      // Vérifier la redirection automatique
      cy.url().should("include", "/dashboard");
    });
  });

  describe("Gestion des erreurs serveur", () => {
    it("devrait afficher une erreur en cas de problème serveur", () => {
      // Intercepter la requête de connexion et simuler une erreur
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 500,
        body: { error: "Erreur serveur" },
      }).as("loginError");

      cy.visit("/auth/login");

      // Remplir le formulaire
      cy.get('input[name="email"]').type("test@example.com");
      cy.get('input[name="password"]').type("password");
      cy.get('button[type="submit"]').click();

      // Attendre la réponse d'erreur
      cy.wait("@loginError");

      // Vérifier le message d'erreur
      cy.contains("Erreur serveur (500)").should("be.visible");
    });
  });

  describe("Accessibilité", () => {
    it("devrait avoir des labels accessibles", () => {
      cy.visit("/auth/login");

      // Vérifier les labels
      cy.get('label[for="email"]').should("contain", "Email");
      cy.get('label[for="password"]').should("contain", "Mot de passe");
    });

    it("devrait avoir des attributs ARIA appropriés", () => {
      cy.visit("/auth/login");

      // Vérifier les attributs ARIA
      cy.get('input[name="email"]').should(
        "have.attr",
        "aria-required",
        "true"
      );
      cy.get('input[name="password"]').should(
        "have.attr",
        "aria-required",
        "true"
      );
      cy.get('button[type="submit"]').should("have.attr", "aria-label");
    });

    it("devrait supporter la navigation au clavier", () => {
      cy.visit("/auth/login");

      // Naviguer avec Tab
      cy.get('input[name="email"]').focus();
      cy.get('input[name="email"]').type("test@example.com");

      cy.get('input[name="password"]').focus();
      cy.get('input[name="password"]').type("password");

      // Soumettre avec Enter
      cy.get('button[type="submit"]').focus();
      cy.get('button[type="submit"]').type("{enter}");
    });
  });

  describe("Responsive design", () => {
    it("devrait fonctionner sur mobile", () => {
      cy.viewport(375, 667); // iPhone SE
      cy.visit("/auth/login");

      // Vérifier que les éléments sont visibles
      cy.contains("Je me connecte").should("be.visible");
      cy.get('input[name="email"]').should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });

    it("devrait fonctionner sur tablette", () => {
      cy.viewport(768, 1024); // iPad
      cy.visit("/auth/login");

      // Vérifier que les éléments sont visibles
      cy.contains("Je me connecte").should("be.visible");
      cy.get('input[name="email"]').should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });
  });

  describe("Performance", () => {
    it("devrait se charger rapidement", () => {
      const startTime = Date.now();

      cy.visit("/auth/login");

      cy.get('input[name="email"]')
        .should("be.visible")
        .then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(3000); // Moins de 3 secondes
        });
    });
  });
});
