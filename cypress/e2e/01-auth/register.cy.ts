import { authHelpers } from "../../support/helpers/auth.helpers";

describe("Inscription utilisateur", () => {
  beforeEach(() => {
    // Nettoyer la base de données avant chaque test
    cy.cleanDatabase();
  });

  describe("Inscription avec données valides", () => {
    it("devrait permettre l'inscription d'un nouvel utilisateur", () => {
      const userData = authHelpers.generateTestUser("newuser");

      cy.visit("/auth/register");

      // Attendre que la page se charge complètement
      cy.wait(2000);

      // Vérifier que la page est chargée (texte plus générique)
      cy.get("body").should("be.visible");

      // Prendre une capture d'écran pour debug
      cy.screenshot("register-page-before-test");

      // Vérifier la présence d'éléments du formulaire
      cy.get('input[name="firstname"]').should("be.visible");

      // Remplir le formulaire d'inscription
      cy.get('input[name="firstname"]').type(userData.firstname);
      cy.get('input[name="lastname"]').type(userData.lastname);
      cy.get('input[name="email"]').type(userData.email);
      cy.get('input[name="password"]').type(userData.password);
      cy.get('input[name="confirmPassword"]').type(userData.password);

      // Soumettre le formulaire
      cy.get('button[type="submit"]').click();

      // Vérifier la redirection vers la création d'organisation
      cy.url().should("include", "/create-organization");

      // Vérifier le message de succès
      cy.verifyToast("Compte créé avec succès");
    });

    it("devrait permettre l'inscription avec un code d'invitation", () => {
      const userData = authHelpers.generateTestUser("inviteduser");
      const inviteCode = "test-invite-code-123";

      // Visiter la page d'inscription avec un code d'invitation
      cy.visit(`/auth/register?invite=${inviteCode}`);

      // Remplir le formulaire
      cy.get('input[name="firstname"]').type(userData.firstname);
      cy.get('input[name="lastname"]').type(userData.lastname);
      cy.get('input[name="email"]').type(userData.email);
      cy.get('input[name="password"]').type(userData.password);
      cy.get('input[name="confirmPassword"]').type(userData.password);

      // Vérifier que le code d'invitation est pré-rempli
      cy.get('input[name="inviteCode"]').should("have.value", inviteCode);

      // Soumettre le formulaire
      cy.get('button[type="submit"]').click();

      // Vérifier la redirection vers le dashboard (car l'utilisateur a une organisation)
      cy.url().should("include", "/dashboard");
    });
  });

  describe("Validation des champs", () => {
    it("devrait afficher une erreur si l'email est déjà utilisé", () => {
      const existingUser = authHelpers.getAdminUser();

      cy.visit("/auth/register");

      // Remplir avec un email existant
      cy.get('input[name="firstname"]').type("Test");
      cy.get('input[name="lastname"]').type("User");
      cy.get('input[name="email"]').type(existingUser.email);
      cy.get('input[name="password"]').type("NewPassword123!");
      cy.get('input[name="confirmPassword"]').type("NewPassword123!");

      cy.get('button[type="submit"]').click();

      // Vérifier le message d'erreur
      cy.contains("Cet email est déjà utilisé").should("be.visible");
    });

    it("devrait afficher une erreur si les mots de passe ne correspondent pas", () => {
      cy.visit("/auth/register");

      // Remplir avec des mots de passe différents
      cy.get('input[name="firstname"]').type("Test");
      cy.get('input[name="lastname"]').type("User");
      cy.get('input[name="email"]').type("test@example.com");
      cy.get('input[name="password"]').type("Password123!");
      cy.get('input[name="confirmPassword"]').type("DifferentPassword123!");

      cy.get('button[type="submit"]').click();

      // Vérifier le message d'erreur
      cy.contains("Les mots de passe ne correspondent pas").should(
        "be.visible"
      );
    });

    it("devrait afficher une erreur si l'email n'est pas valide", () => {
      cy.visit("/auth/register");

      // Remplir avec un email invalide
      cy.get('input[name="firstname"]').type("Test");
      cy.get('input[name="lastname"]').type("User");
      cy.get('input[name="email"]').type("email-invalide");
      cy.get('input[name="password"]').type("Password123!");
      cy.get('input[name="confirmPassword"]').type("Password123!");

      cy.get('button[type="submit"]').click();

      // Vérifier le message d'erreur
      cy.contains("Format d'email invalide").should("be.visible");
    });

    it("devrait afficher une erreur si le mot de passe est trop faible", () => {
      cy.visit("/auth/register");

      // Remplir avec un mot de passe faible
      cy.get('input[name="firstname"]').type("Test");
      cy.get('input[name="lastname"]').type("User");
      cy.get('input[name="email"]').type("test@example.com");
      cy.get('input[name="password"]').type("123");
      cy.get('input[name="confirmPassword"]').type("123");

      cy.get('button[type="submit"]').click();

      // Vérifier le message d'erreur
      cy.contains("Le mot de passe doit contenir au moins 8 caractères").should(
        "be.visible"
      );
    });

    it("devrait afficher une erreur si les champs obligatoires sont vides", () => {
      cy.visit("/auth/register");

      // Essayer de soumettre sans remplir
      cy.get('button[type="submit"]').click();

      // Vérifier les messages d'erreur
      cy.contains("Le prénom est requis").should("be.visible");
      cy.contains("Le nom est requis").should("be.visible");
      cy.contains("L'email est requis").should("be.visible");
      cy.contains("Le mot de passe est requis").should("be.visible");
    });
  });

  describe("Navigation et liens", () => {
    it("devrait rediriger vers la page de connexion", () => {
      cy.visit("/auth/register");

      // Cliquer sur le lien "Se connecter"
      cy.contains("Se connecter").click();

      // Vérifier la redirection
      cy.url().should("include", "/auth/login");
    });

    it("devrait rediriger vers la page de connexion Google", () => {
      cy.visit("/auth/register");

      // Cliquer sur le bouton Google
      cy.get('[data-testid="google-signup-button"]').click();

      // Vérifier la redirection vers Google
      cy.url().should("include", "/auth/google");
    });
  });

  describe("Gestion des erreurs serveur", () => {
    it("devrait afficher une erreur en cas de problème serveur", () => {
      // Intercepter la requête d'inscription et simuler une erreur
      cy.intercept("POST", "/api/auth/register", {
        statusCode: 500,
        body: { error: "Erreur serveur" },
      }).as("registerError");

      const userData = authHelpers.generateTestUser("servererror");

      cy.visit("/auth/register");

      // Remplir le formulaire
      cy.get('input[name="firstname"]').type(userData.firstname);
      cy.get('input[name="lastname"]').type(userData.lastname);
      cy.get('input[name="email"]').type(userData.email);
      cy.get('input[name="password"]').type(userData.password);
      cy.get('input[name="confirmPassword"]').type(userData.password);

      cy.get('button[type="submit"]').click();

      // Attendre la réponse d'erreur
      cy.wait("@registerError");

      // Vérifier le message d'erreur
      cy.contains("Une erreur serveur est survenue").should("be.visible");
    });
  });

  describe("Accessibilité", () => {
    it("devrait avoir des labels accessibles", () => {
      cy.visit("/auth/register");

      // Vérifier les labels
      cy.get('label[for="firstname"]').should("contain", "Prénom");
      cy.get('label[for="lastname"]').should("contain", "Nom");
      cy.get('label[for="email"]').should("contain", "Email");
      cy.get('label[for="password"]').should("contain", "Mot de passe");
      cy.get('label[for="confirmPassword"]').should(
        "contain",
        "Confirmer le mot de passe"
      );
    });

    it("devrait avoir des attributs ARIA appropriés", () => {
      cy.visit("/auth/register");

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
  });

  describe("Responsive design", () => {
    it("devrait fonctionner sur mobile", () => {
      cy.viewport(375, 667); // iPhone SE
      cy.visit("/auth/register");

      // Vérifier que les éléments sont visibles
      cy.contains("Je me crée un compte").should("be.visible");
      cy.get('input[name="email"]').should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });

    it("devrait fonctionner sur tablette", () => {
      cy.viewport(768, 1024); // iPad
      cy.visit("/auth/register");

      // Vérifier que les éléments sont visibles
      cy.contains("Je me crée un compte").should("be.visible");
      cy.get('input[name="email"]').should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });
  });
});
