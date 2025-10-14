// Test d'intégration d'authentification avec les bons sélecteurs - Version 2
describe("Intégration d'authentification - Version corrigée V2", () => {
  beforeEach(() => {
    // Nettoyer la base de données avant chaque test
    cy.cleanDatabase();
  });

  it("devrait permettre un cycle complet d'inscription, connexion et déconnexion", () => {
    // 1. Inscription
    cy.visit("/auth/register");
    cy.wait(2000);
    cy.get("body").should("be.visible");

    // Vérifier que la page est chargée
    cy.contains("Bienvenue").should("be.visible");

    // Remplir le formulaire d'inscription
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier la redirection vers la page de connexion
    cy.url().should("include", "/auth/login");
    cy.contains("Connexion").should("be.visible");

    // 2. Connexion
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Vérifier la redirection vers le dashboard
    cy.url().should("include", "/dashboard");

    // 3. Déconnexion
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();

    // Vérifier la redirection vers la page de connexion
    cy.url().should("include", "/auth/login");
    cy.contains("Connexion").should("be.visible");
  });

  it("devrait permettre la navigation entre les pages d'authentification", () => {
    // Aller à la page de connexion
    cy.visit("/auth/login");
    cy.contains("Connexion").should("be.visible");

    // Naviguer vers la page d'inscription
    cy.get('a[href="/auth/register"]').click();
    cy.url().should("include", "/auth/register");
    cy.contains("Bienvenue").should("be.visible");

    // Naviguer vers la page de connexion
    cy.get('a[href="/auth/login"]').click();
    cy.url().should("include", "/auth/login");
    cy.contains("Connexion").should("be.visible");
  });

  it("devrait permettre le retour à l'accueil depuis les pages d'authentification", () => {
    // Test depuis la page de connexion
    cy.visit("/auth/login");
    cy.get("button").contains("Retour").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Test depuis la page d'inscription
    cy.visit("/auth/register");
    cy.get('a[href="/"]').contains("Retour à l'accueil").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("devrait gérer les erreurs d'authentification de manière cohérente", () => {
    // Test d'erreur d'inscription
    cy.visit("/auth/register");
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("DifferentPassword123!");
    cy.get('button[type="submit"]').click();
    cy.contains("Les mots de passe ne correspondent pas").should("be.visible");

    // Test d'erreur de connexion
    cy.visit("/auth/login");
    cy.get("input#email").type("wrong@example.com");
    cy.get("input#password").type("WrongPassword123!");
    cy.get('button[type="submit"]').click();
    cy.contains("Identifiants incorrects").should("be.visible");
  });

  it("devrait maintenir l'état d'authentification entre les pages", () => {
    // Créer et connecter un utilisateur via l'interface
    cy.visit("/auth/register");
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Attendre la redirection
    cy.url().should("include", "/auth/login");

    // Se connecter
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Vérifier qu'on est sur le dashboard
    cy.url().should("include", "/dashboard");

    // Naviguer vers une autre page protégée
    cy.visit("/dashboard/profile");
    cy.url().should("include", "/dashboard/profile");

    // Vérifier qu'on est toujours connecté
    cy.get('[data-testid="user-menu"]').should("be.visible");
  });

  it("devrait gérer les sessions multiples de manière sécurisée", () => {
    // Créer un utilisateur via l'interface
    cy.visit("/auth/register");
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Attendre la redirection
    cy.url().should("include", "/auth/login");

    // Se connecter
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Vérifier qu'on est sur le dashboard
    cy.url().should("include", "/dashboard");

    // Ouvrir un nouvel onglet et vérifier qu'on est toujours connecté
    cy.window().then((win) => {
      win.open("/dashboard", "_blank");
    });

    // Vérifier que la session est maintenue
    cy.get('[data-testid="user-menu"]').should("be.visible");
  });

  it("devrait gérer les timeouts de session de manière appropriée", () => {
    // Créer et connecter un utilisateur via l'interface
    cy.visit("/auth/register");
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Attendre la redirection
    cy.url().should("include", "/auth/login");

    // Se connecter
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Vérifier qu'on est sur le dashboard
    cy.url().should("include", "/dashboard");

    // Simuler un timeout de session (en supprimant le token)
    cy.window().then((win) => {
      win.localStorage.removeItem("auth-token");
    });

    // Essayer d'accéder à une page protégée
    cy.visit("/dashboard");

    // Vérifier la redirection vers la page de connexion
    cy.url().should("include", "/auth/login");
  });

  it("devrait gérer les erreurs de validation de manière cohérente", () => {
    // Test d'erreur d'inscription - email invalide
    cy.visit("/auth/register");
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("invalid-email");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");
    cy.get('button[type="submit"]').click();
    cy.contains("Format d'email invalide").should("be.visible");

    // Test d'erreur d'inscription - mot de passe trop court
    cy.visit("/auth/register");
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("123");
    cy.get("input#confirmpassword").type("123");
    cy.get('button[type="submit"]').click();
    cy.contains("Le mot de passe doit contenir au moins 8 caractères").should(
      "be.visible"
    );

    // Test d'erreur de connexion - email invalide
    cy.visit("/auth/login");
    cy.get("input#email").type("invalid-email");
    cy.get("input#password").type("TestPassword123!");
    cy.get('button[type="submit"]').click();
    cy.contains("Format d'email invalide").should("be.visible");
  });

  it("devrait gérer les champs obligatoires de manière cohérente", () => {
    // Test d'inscription avec champs vides
    cy.visit("/auth/register");
    cy.get('button[type="submit"]').click();

    // Vérifier que les champs obligatoires sont marqués
    cy.get("input#firstname").should("have.attr", "required");
    cy.get("input#lastname").should("have.attr", "required");
    cy.get("input#email").should("have.attr", "required");
    cy.get("input#password").should("have.attr", "required");
    cy.get("input#confirmpassword").should("have.attr", "required");

    // Test de connexion avec champs vides
    cy.visit("/auth/login");
    cy.get('button[type="submit"]').click();

    // Vérifier que les champs obligatoires sont marqués
    cy.get("input#email").should("have.attr", "required");
    cy.get("input#password").should("have.attr", "required");
  });

  it("devrait gérer les messages d'erreur de manière cohérente", () => {
    // Test d'inscription avec email déjà utilisé
    cy.visit("/auth/register");
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Attendre la redirection
    cy.url().should("include", "/auth/login");

    // Essayer de créer le même utilisateur
    cy.visit("/auth/register");
    cy.get("input#firstname").type("New");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Vérifier le message d'erreur
    cy.contains("Cet email est déjà utilisé").should("be.visible");
  });
});
