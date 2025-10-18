import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatEventStatus = (status: string): string => {
  switch (status) {
    case "A_VENIR":
      return "À venir";
    case "EN_COURS":
      return "En cours";
    case "TERMINE":
      return "Terminé";
    case "ANNULE":
      return "Annulé";
    default:
      return status;
  }
};

export const formatDateToFrench = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "—";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return "—";
  }
};
