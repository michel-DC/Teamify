// Helpers pour les événements
export const eventHelpers = {
  /**
   * Génère des données d'événement de test
   */
  generateTestEvent: (title: string = "Test Event") => ({
    title,
    description: "Un événement de test pour les tests E2E",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
    endDate: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
    ).toISOString(), // +8h
    location: "Paris, France",
    locationCoords: {
      lat: 48.8566,
      lon: 2.3522,
    },
    capacity: 50,
    budget: 1000,
    category: "REUNION",
    isPublic: true,
  }),

  /**
   * Catégories d'événements disponibles
   */
  categories: [
    "REUNION",
    "SEMINAIRE",
    "CONFERENCE",
    "FORMATION",
    "ATELIER",
    "NETWORKING",
    "CEREMONIE",
    "EXPOSITION",
    "CONCERT",
    "SPECTACLE",
    "AUTRE",
  ],

  /**
   * Statuts d'événements
   */
  statuses: {
    A_VENIR: "A_VENIR",
    EN_COURS: "EN_COURS",
    TERMINE: "TERMINE",
    ANNULE: "ANNULE",
  },

  /**
   * Génère des données de tâche de préparation
   */
  generateTodo: (title: string = "Test Todo") => ({
    title,
    description: "Description de la tâche de test",
    assignedTo: null,
    groupId: null,
  }),

  /**
   * Génère des données de groupe de tâches
   */
  generateTodoGroup: (name: string = "Test Group") => ({
    name,
    color: "#3b82f6",
    order: 0,
  }),
};
