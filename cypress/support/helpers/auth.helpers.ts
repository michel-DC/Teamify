// Helpers pour l'authentification
export const authHelpers = {
  /**
   * Génère des données d'utilisateur de test
   */
  generateTestUser: (prefix: string = "test") => ({
    email: `${prefix}@example.com`,
    password: "TestPassword123!",
    firstname: "Test",
    lastname: "User",
  }),

  /**
   * Génère un email unique pour les tests
   */
  generateUniqueEmail: (prefix: string = "test") => {
    const timestamp = Date.now();
    return `${prefix}-${timestamp}@example.com`;
  },

  /**
   * Données d'utilisateur admin
   */
  getAdminUser: () => ({
    email: "admin@example.com",
    password: "AdminPassword123!",
    firstname: "Admin",
    lastname: "User",
  }),

  /**
   * Données d'utilisateur membre
   */
  getMemberUser: () => ({
    email: "member@example.com",
    password: "MemberPassword123!",
    firstname: "Member",
    lastname: "User",
  }),
};
