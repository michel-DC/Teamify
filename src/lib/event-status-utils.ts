import { EventStatus } from "@prisma/client";

export function calculateEventStatus(
  startDate: string | Date,
  endDate: string | Date
): EventStatus {
  const now = new Date();
  const nowUTC = now.getTime();

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startUTC = start.getTime();
  const endUTC = end.getTime();

  if (endUTC < nowUTC) {
    return EventStatus.TERMINE;
  }

  if (startUTC < nowUTC && endUTC > nowUTC) {
    return EventStatus.EN_COURS;
  }

  return EventStatus.A_VENIR;
}

export function shouldUpdateEventStatus(
  currentStatus: EventStatus,
  startDate: string | Date,
  endDate: string | Date
): boolean {
  const calculatedStatus = calculateEventStatus(startDate, endDate);
  return currentStatus !== calculatedStatus;
}
