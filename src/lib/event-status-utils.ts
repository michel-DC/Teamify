import { EventStatus } from "@prisma/client";

/**
 * Calcule automatiquement le statut d'un événement basé sur ses dates
 * Utilise UTC (temps universel) pour garantir la cohérence mondiale
 * @param startDate - Date de début de l'événement
 * @param endDate - Date de fin de l'événement
 * @returns Le statut calculé automatiquement
 */
export function calculateEventStatus(
  startDate: string | Date,
  endDate: string | Date
): EventStatus {
  // Utilisation d'UTC pour garantir la cohérence mondiale
  // Conversion en timestamps UTC pour une comparaison précise
  const now = new Date();
  const nowUTC = now.getTime(); // getTime() retourne déjà en millisecondes UTC

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Conversion en timestamps UTC
  const startUTC = start.getTime();
  const endUTC = end.getTime();

  // Si la date de fin est passée en UTC (incluant les minutes), l'événement est terminé
  if (endUTC < nowUTC) {
    return EventStatus.TERMINE;
  }

  // Si la date de début est passée mais la date de fin est dans le futur en UTC, l'événement est en cours
  if (startUTC < nowUTC && endUTC > nowUTC) {
    return EventStatus.EN_COURS;
  }

  // Sinon, l'événement est à venir
  return EventStatus.A_VENIR;
}

/**
 * Vérifie si un événement nécessite une mise à jour de statut
 * @param currentStatus - Statut actuel de l'événement
 * @param startDate - Date de début de l'événement
 * @param endDate - Date de fin de l'événement
 * @returns true si le statut doit être mis à jour
 */
export function shouldUpdateEventStatus(
  currentStatus: EventStatus,
  startDate: string | Date,
  endDate: string | Date
): boolean {
  const calculatedStatus = calculateEventStatus(startDate, endDate);
  return currentStatus !== calculatedStatus;
}
