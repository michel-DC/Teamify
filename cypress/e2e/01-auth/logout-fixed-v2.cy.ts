// Test de déconnexion utilisateur avec les bons sélecteurs - Version 2
describe("Déconnexion utilisateur - Version corrigée V2", () => {
  beforeEach(() => {
    // Nettoyer la base de données avant chaque test
    cy.cleanDatabase();
  });

  it("devrait permettre la déconnexion d'un utilisateur connecté", () => {
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

    // Chercher le menu utilisateur (sélecteur adaptatif)
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

    // Se déconnecter
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();

    // Vérifier le message de confirmation
    cy.contains("Vous avez été déconnecté").should("be.visible");
  });

  it("devrait permettre la reconnexion après déconnexion", () => {
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

    // Se déconnecter
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();

    // Essayer d'accéder à une page protégée
    cy.visit("/dashboard");

    // Vérifier la redirection vers la page de connexion
    cy.url().should("include", "/auth/login");
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
});
