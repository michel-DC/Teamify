// Test de connexion utilisateur avec les bons sélecteurs - Version 2
describe("Connexion utilisateur - Version corrigée V2", () => {
  beforeEach(() => {
    // Nettoyer la base de données avant chaque test
    cy.cleanDatabase();
  });

  it("devrait permettre la connexion d'un utilisateur existant", () => {
    // Créer un utilisateur de test d'abord via l'interface
    cy.visit("/auth/register");
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Attendre la redirection
    cy.url().should("include", "/auth/login");

    // Maintenant se connecter
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Vérifier la redirection vers le dashboard
    cy.url().should("include", "/dashboard");
  });

  it("devrait afficher une erreur pour des identifiants incorrects", () => {
    cy.visit("/auth/login");

    // Remplir avec des identifiants incorrects
    cy.get("input#email").type("wrong@example.com");
    cy.get("input#password").type("WrongPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier qu'une erreur est affichée
    cy.contains("Identifiants incorrects").should("be.visible");
  });

  it("devrait afficher une erreur pour un email invalide", () => {
    cy.visit("/auth/login");

    // Remplir avec un email invalide
    cy.get("input#email").type("invalid-email");
    cy.get("input#password").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier qu'une erreur est affichée
    cy.contains("Format d'email invalide").should("be.visible");
  });

  it("devrait afficher une erreur pour un mot de passe vide", () => {
    cy.visit("/auth/login");

    // Remplir seulement l'email
    cy.get("input#email").type("test@example.com");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier qu'une erreur est affichée
    cy.contains("Le mot de passe est requis").should("be.visible");
  });

  it("devrait afficher une erreur pour un email vide", () => {
    cy.visit("/auth/login");

    // Remplir seulement le mot de passe
    cy.get("input#password").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier qu'une erreur est affichée
    cy.contains("L'email est requis").should("be.visible");
  });

  it("devrait afficher le bouton Google", () => {
    cy.visit("/auth/login");

    // Vérifier que le bouton Google est présent
    cy.contains("Continuer avec Google").should("be.visible");
    cy.get("button").contains("Continuer avec Google").should("be.visible");
  });

  it("devrait permettre la navigation vers la page d'inscription", () => {
    cy.visit("/auth/login");

    // Cliquer sur le lien d'inscription
    cy.contains("Pas encore de compte ?").should("be.visible");
    cy.get('a[href="/auth/register"]').click();

    // Vérifier la redirection
    cy.url().should("include", "/auth/register");
    cy.contains("Bienvenue").should("be.visible");
  });

  it("devrait permettre le retour à l'accueil", () => {
    cy.visit("/auth/login");

    // Cliquer sur le bouton de retour
    cy.get("button").contains("Retour").click();

    // Vérifier la redirection
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("devrait afficher les champs obligatoires", () => {
    cy.visit("/auth/login");

    // Vérifier que tous les champs sont présents
    cy.get("input#email").should("be.visible");
    cy.get("input#password").should("be.visible");

    // Vérifier que les labels sont présents
    cy.contains("Adresse mail").should("be.visible");
    cy.contains("Mot de passe").should("be.visible");
  });

  it("devrait permettre de basculer la visibilité du mot de passe", () => {
    cy.visit("/auth/login");

    // Remplir le mot de passe
    cy.get("input#password").type("TestPassword123!");

    // Vérifier que le mot de passe est masqué par défaut
    cy.get("input#password").should("have.attr", "type", "password");

    // Chercher le bouton d'œil dans le conteneur parent
    cy.get("input#password")
      .parent()
      .parent()
      .within(() => {
        cy.get("button").first().click();
      });

    // Vérifier que le mot de passe est maintenant visible
    cy.get("input#password").should("have.attr", "type", "text");
  });

  it("devrait désactiver le bouton de soumission pendant le chargement", () => {
    cy.visit("/auth/login");

    // Remplir le formulaire
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier que le bouton est désactivé pendant le chargement
    cy.get('button[type="submit"]').should("be.disabled");
    cy.contains("Connexion en cours...").should("be.visible");
  });

  it("devrait permettre la réinitialisation du mot de passe", () => {
    cy.visit("/auth/login");

    // Cliquer sur le lien de réinitialisation
    cy.contains("Mot de passe oublié ?").should("be.visible");
    cy.get('a[href="/auth/forgot-password"]').click();

    // Vérifier la redirection
    cy.url().should("include", "/auth/forgot-password");
    cy.contains("Réinitialisation du mot de passe").should("be.visible");
  });

  it("devrait valider le format de l'email", () => {
    cy.visit("/auth/login");

    // Remplir avec un email invalide
    cy.get("input#email").type("not-an-email");
    cy.get("input#password").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier qu'une erreur est affichée
    cy.contains("Format d'email invalide").should("be.visible");
  });

  it("devrait gérer les erreurs de validation côté client", () => {
    cy.visit("/auth/login");

    // Essayer de soumettre sans remplir
    cy.get('button[type="submit"]').click();

    // Vérifier que les champs obligatoires sont marqués
    cy.get("input#email").should("have.attr", "required");
    cy.get("input#password").should("have.attr", "required");
  });

  it("devrait maintenir l'état du formulaire en cas d'erreur", () => {
    cy.visit("/auth/login");

    // Remplir le formulaire
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");

    // Soumettre avec des identifiants incorrects
    cy.get('button[type="submit"]').click();

    // Vérifier que les champs gardent leurs valeurs
    cy.get("input#email").should("have.value", "test@example.com");
    cy.get("input#password").should("have.value", "TestPassword123!");
  });
});
