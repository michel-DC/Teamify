// Helpers pour les organisations
export const organizationHelpers = {
  /**
   * Génère des données d'organisation de test
   */
  generateTestOrganization: (name: string = "Test Organization") => ({
    name,
    bio: "Une organisation de test pour les tests E2E",
    organizationType: "ASSOCIATION",
    mission: "Mission de test pour l'organisation",
    location: {
      city: "Paris",
      lat: 48.8566,
      lon: 2.3522,
      displayName: "Paris, France",
    },
  }),

  /**
   * Types d'organisations disponibles
   */
  organizationTypes: [
    "ASSOCIATION",
    "PME",
    "ENTREPRISE",
    "STARTUP",
    "AUTO_ENTREPRENEUR",
  ],

  /**
   * Génère des données d'invitation
   */
  generateInvitationData: (email: string) => ({
    email,
    organizationId: 1, // Sera remplacé par l'ID réel
  }),

  /**
   * Rôles d'organisation
   */
  roles: {
    OWNER: "OWNER",
    ADMIN: "ADMIN",
    MEMBER: "MEMBER",
  },
};
