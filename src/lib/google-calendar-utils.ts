/**
 * Utilitaires pour l'intégration avec Google Calendar
 */

/**
 * Convertit une date en format UTC pour Google Calendar
 * Format requis: YYYYMMDDTHHmmssZ
 */
function formatDateForGoogleCalendar(date: Date | string | null): string {
  if (!date) {
    throw new Error("Date is required");
  }

  // Convertir en objet Date si c'est une chaîne
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Vérifier que la date est valide
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date provided");
  }

  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const hours = String(dateObj.getUTCHours()).padStart(2, "0");
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Encode une chaîne pour l'URL (remplace les espaces par %20, etc.)
 */
function encodeForUrl(text: string): string {
  return encodeURIComponent(text);
}

/**
 * Génère l'URL Google Calendar pour ajouter un événement
 */
export function generateGoogleCalendarUrl(event: {
  title: string;
  description?: string | null;
  location?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}): string {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";

  // Paramètres de base
  const params = new URLSearchParams();

  // Titre de l'événement
  if (event.title) {
    params.append("text", event.title);
  }

  // Description de l'événement
  if (event.description) {
    params.append("details", event.description);
  }

  // Lieu de l'événement
  if (event.location) {
    params.append("location", event.location);
  }

  // Dates de début et fin
  if (event.startDate && event.endDate) {
    const startDateFormatted = formatDateForGoogleCalendar(event.startDate);
    const endDateFormatted = formatDateForGoogleCalendar(event.endDate);
    params.append("dates", `${startDateFormatted}/${endDateFormatted}`);
  } else if (event.startDate) {
    // Si seule la date de début est disponible, on crée un événement d'1 heure
    const startDateFormatted = formatDateForGoogleCalendar(event.startDate);
    const endDate = new Date(event.startDate.getTime() + 60 * 60 * 1000); // +1 heure
    const endDateFormatted = formatDateForGoogleCalendar(endDate);
    params.append("dates", `${startDateFormatted}/${endDateFormatted}`);
  }

  return `${baseUrl}&${params.toString()}`;
}

/**
 * Ouvre Google Calendar dans un nouvel onglet avec l'événement pré-rempli
 */
export function addEventToGoogleCalendar(event: {
  title: string;
  description?: string | null;
  location?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}): void {
  try {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error(
      "Erreur lors de la génération de l'URL Google Calendar:",
      error
    );
    // Fallback: ouvrir Google Calendar sans pré-remplissage
    window.open(
      "https://calendar.google.com/calendar/render?action=TEMPLATE",
      "_blank",
      "noopener,noreferrer"
    );
  }
}
