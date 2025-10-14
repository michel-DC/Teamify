// Test d'intégration d'authentification avec les bons sélecteurs
describe("Intégration d'authentification - Version corrigée", () => {
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
    // Créer et connecter un utilisateur
    cy.request("POST", "/api/auth/register", {
      firstname: "Test",
      lastname: "User",
      email: "test@example.com",
      passwordHash: "TestPassword123!",
    });

    // Se connecter
    cy.visit("/auth/login");
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

  it("devrait gérer les codes d'invitation de manière cohérente", () => {
    // Créer une organisation et un code d'invitation
    cy.createOrganization({
      name: "Test Organization",
      organizationType: "ASSOCIATION",
      mission: "Test mission",
    }).then((response) => {
      const orgId = response.body.id;

      // Créer un code d'invitation
      cy.request("POST", "/api/organizations/invite", {
        organizationId: orgId,
        email: "invited@example.com",
        role: "MEMBER",
      }).then((inviteResponse) => {
        const inviteCode = inviteResponse.body.inviteCode;

        // Test d'inscription avec code d'invitation
        cy.visit(`/auth/register?invite=${inviteCode}`);
        cy.get("input#firstname").type("Invited");
        cy.get("input#lastname").type("User");
        cy.get("input#email").type("invited@example.com");
        cy.get("input#password").type("TestPassword123!");
        cy.get("input#confirmpassword").type("TestPassword123!");
        cy.get('button[type="submit"]').click();
        cy.url().should("include", "/dashboard");

        // Se déconnecter
        cy.get('[data-testid="user-menu"]').click();
        cy.get('[data-testid="logout-button"]').click();

        // Test de connexion avec code d'invitation
        cy.visit(`/auth/login?invite=${inviteCode}`);
        cy.get("input#email").type("invited@example.com");
        cy.get("input#password").type("TestPassword123!");
        cy.get('button[type="submit"]').click();
        cy.url().should("include", "/dashboard");
      });
    });
  });

  it("devrait gérer les sessions multiples de manière sécurisée", () => {
    // Créer un utilisateur
    cy.request("POST", "/api/auth/register", {
      firstname: "Test",
      lastname: "User",
      email: "test@example.com",
      passwordHash: "TestPassword123!",
    });

    // Se connecter dans un onglet
    cy.visit("/auth/login");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");

    // Ouvrir un nouvel onglet et vérifier qu'on est toujours connecté
    cy.window().then((win) => {
      win.open("/dashboard", "_blank");
    });

    // Vérifier que la session est maintenue
    cy.get('[data-testid="user-menu"]').should("be.visible");
  });

  it("devrait gérer les timeouts de session de manière appropriée", () => {
    // Créer et connecter un utilisateur
    cy.request("POST", "/api/auth/register", {
      firstname: "Test",
      lastname: "User",
      email: "test@example.com",
      passwordHash: "TestPassword123!",
    });

    // Se connecter
    cy.visit("/auth/login");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");

    // Simuler un timeout de session (en supprimant le token)
    cy.window().then((win) => {
      win.localStorage.removeItem("auth-token");
    });

    // Essayer d'accéder à une page protégée
    cy.visit("/dashboard");
    cy.url().should("include", "/auth/login");
  });
});
