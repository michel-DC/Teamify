// Test d'inscription utilisateur avec les bons sélecteurs - Version 9
describe("Inscription utilisateur - Version corrigée V9", () => {
  beforeEach(() => {
    // Nettoyer la base de données avant chaque test
    cy.cleanDatabase();
  });

  it("devrait permettre l'inscription d'un nouvel utilisateur", () => {
    cy.visit("/auth/register");

    // Attendre que la page se charge
    cy.wait(2000);
    cy.get("body").should("be.visible");
    cy.screenshot("register-page-before-test");

    // Vérifier que la page est chargée
    cy.contains("Bienvenue").should("be.visible");

    // Remplir le formulaire d'inscription avec les vrais sélecteurs
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait(3000);

    // Vérifier la redirection vers la page de connexion
    cy.url().should("include", "/auth/login");
    cy.contains("Connexion").should("be.visible");
  });

  it("devrait afficher une erreur pour un email déjà utilisé", () => {
    // Créer un utilisateur existant d'abord via l'interface
    cy.visit("/auth/register");
    cy.get("input#firstname").type("Existing");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("existing@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");
    cy.get('button[type="submit"]').click();

    // Attendre la redirection
    cy.url().should("include", "/auth/login");

    // Maintenant essayer de créer le même utilisateur
    cy.visit("/auth/register");
    cy.get("input#firstname").type("New");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("existing@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait(3000);

    // Vérifier qu'une erreur est affichée (message d'erreur de l'API)
    cy.contains("Cet email est déjà utilisé").should("be.visible");
  });

  it("devrait afficher une erreur pour des mots de passe différents", () => {
    cy.visit("/auth/register");

    // Remplir avec des mots de passe différents
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("DifferentPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier qu'une erreur est affichée
    cy.contains("Les mots de passe ne correspondent pas").should("be.visible");
  });

  it("devrait afficher une erreur pour un email invalide", () => {
    cy.visit("/auth/register");

    // Remplir avec un email invalide
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("invalid-email");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait(3000);

    // Vérifier qu'une erreur est affichée (message d'erreur de l'API)
    cy.contains("Format d'email invalide").should("be.visible");
  });

  it("devrait afficher une erreur pour un mot de passe trop court", () => {
    cy.visit("/auth/register");

    // Remplir avec un mot de passe trop court
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("123");
    cy.get("input#confirmpassword").type("123");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait(3000);

    // Vérifier qu'une erreur est affichée (message d'erreur de l'API)
    cy.contains("Le mot de passe doit contenir au moins 8 caractères").should(
      "be.visible"
    );
  });

  it("devrait afficher le bouton Google", () => {
    cy.visit("/auth/register");

    // Vérifier que le bouton Google est présent
    cy.contains("Continuer avec Google").should("be.visible");
    cy.get("button").contains("Continuer avec Google").should("be.visible");
  });

  it("devrait permettre la navigation vers la page de connexion", () => {
    cy.visit("/auth/register");

    // Cliquer sur le lien de connexion
    cy.contains("Déjà un compte ?").should("be.visible");
    cy.get('a[href="/auth/login"]').click();

    // Vérifier la redirection
    cy.url().should("include", "/auth/login");
    cy.contains("Connexion").should("be.visible");
  });

  it("devrait permettre le retour à l'accueil", () => {
    cy.visit("/auth/register");

    // Cliquer sur le bouton de retour
    cy.get('a[href="/"]').contains("Retour à l'accueil").click();

    // Vérifier la redirection
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("devrait afficher les champs obligatoires", () => {
    cy.visit("/auth/register");

    // Vérifier que tous les champs sont présents
    cy.get("input#firstname").should("be.visible");
    cy.get("input#lastname").should("be.visible");
    cy.get("input#email").should("be.visible");
    cy.get("input#password").should("be.visible");
    cy.get("input#confirmpassword").should("be.visible");

    // Vérifier que les labels sont présents
    cy.contains("Prénom").should("be.visible");
    cy.contains("Nom").should("be.visible");
    cy.contains("Adresse mail").should("be.visible");
    cy.contains("Mot de passe").should("be.visible");
    cy.contains("Confirmez votre mot de passe").should("be.visible");
  });

  it("devrait permettre de basculer la visibilité du mot de passe", () => {
    cy.visit("/auth/register");

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

  it("devrait permettre de basculer la visibilité de la confirmation du mot de passe", () => {
    cy.visit("/auth/register");

    // Remplir la confirmation du mot de passe
    cy.get("input#confirmpassword").type("TestPassword123!");

    // Vérifier que la confirmation est masquée par défaut
    cy.get("input#confirmpassword").should("have.attr", "type", "password");

    // Chercher le bouton d'œil dans le conteneur parent
    cy.get("input#confirmpassword")
      .parent()
      .parent()
      .within(() => {
        cy.get("button").first().click();
      });

    // Vérifier que la confirmation est maintenant visible
    cy.get("input#confirmpassword").should("have.attr", "type", "text");
  });

  it("devrait désactiver le bouton de soumission pendant le chargement", () => {
    cy.visit("/auth/register");

    // Remplir le formulaire
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier que le bouton est désactivé pendant le chargement
    cy.get('button[type="submit"]').should("be.disabled");
    cy.contains("Création en cours...").should("be.visible");
  });

  it("devrait afficher les messages d'erreur appropriés", () => {
    cy.visit("/auth/register");

    // Test avec des champs vides
    cy.get('button[type="submit"]').click();

    // Vérifier que les champs obligatoires sont marqués
    cy.get("input#firstname").should("have.attr", "required");
    cy.get("input#lastname").should("have.attr", "required");
    cy.get("input#email").should("have.attr", "required");
    cy.get("input#password").should("have.attr", "required");
    cy.get("input#confirmpassword").should("have.attr", "required");
  });

  it("devrait valider le format de l'email", () => {
    cy.visit("/auth/register");

    // Remplir avec un email invalide
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("not-an-email");
    cy.get("input#password").type("TestPassword123!");
    cy.get("input#confirmpassword").type("TestPassword123!");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait(3000);

    // Vérifier qu'une erreur est affichée
    cy.contains("Format d'email invalide").should("be.visible");
  });

  it("devrait valider la force du mot de passe", () => {
    cy.visit("/auth/register");

    // Remplir avec un mot de passe faible
    cy.get("input#firstname").type("Test");
    cy.get("input#lastname").type("User");
    cy.get("input#email").type("test@example.com");
    cy.get("input#password").type("123");
    cy.get("input#confirmpassword").type("123");

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait(3000);

    // Vérifier qu'une erreur est affichée
    cy.contains("Le mot de passe doit contenir au moins 8 caractères").should(
      "be.visible"
    );
  });
});
