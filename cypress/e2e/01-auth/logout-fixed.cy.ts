// Test de déconnexion utilisateur avec les bons sélecteurs
describe("Déconnexion utilisateur - Version corrigée", () => {
  beforeEach(() => {
    // Nettoyer la base de données avant chaque test
    cy.cleanDatabase();
  });

  it("devrait permettre la déconnexion d'un utilisateur connecté", () => {
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

    // Cliquer sur le menu utilisateur (sélecteur adaptatif)
    cy.get('[data-testid="user-menu"]').click();

    // Cliquer sur le bouton de déconnexion
    cy.get('[data-testid="logout-button"]').click();

    // Vérifier la redirection vers la page de connexion
    cy.url().should("include", "/auth/login");
    cy.contains("Connexion").should("be.visible");
  });

  it("devrait rediriger vers la page de connexion si non connecté", () => {
    // Visiter une page protégée sans être connecté
    cy.visit("/dashboard");

    // Vérifier la redirection vers la page de connexion
    cy.url().should("include", "/auth/login");
    cy.contains("Connexion").should("be.visible");
  });

  it("devrait nettoyer les données de session lors de la déconnexion", () => {
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

    // Vérifier que les données de session sont présentes
    cy.window().then((win) => {
      expect(win.localStorage.getItem("auth-token")).to.exist;
    });

    // Se déconnecter
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();

    // Vérifier que les données de session sont supprimées
    cy.window().then((win) => {
      expect(win.localStorage.getItem("auth-token")).to.be.null;
    });
  });

  it("devrait afficher un message de confirmation lors de la déconnexion", () => {
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

    // Se déconnecter
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();

    // Vérifier le message de confirmation
    cy.contains("Vous avez été déconnecté").should("be.visible");
  });

  it("devrait permettre la reconnexion après déconnexion", () => {
    // Créer un utilisateur
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

    // Se déconnecter
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();

    // Vérifier la redirection vers la page de connexion
    cy.url().should("include", "/auth/login");

    // Se reconnecter
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Vérifier qu'on est de nouveau sur le dashboard
    cy.url().should("include", "/dashboard");
  });

  it("devrait empêcher l'accès aux pages protégées après déconnexion", () => {
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

    // Se déconnecter
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();

    // Essayer d'accéder à une page protégée
    cy.visit("/dashboard");

    // Vérifier la redirection vers la page de connexion
    cy.url().should("include", "/auth/login");
  });
});
