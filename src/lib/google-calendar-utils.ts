function formatDateForGoogleCalendar(date: Date | string | null): string {
  if (!date) {
    throw new Error("Date is required");
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;

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

function encodeForUrl(text: string): string {
  return encodeURIComponent(text);
}

export function generateGoogleCalendarUrl(event: {
  title: string;
  description?: string | null;
  location?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}): string {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";

  const params = new URLSearchParams();

  if (event.title) {
    params.append("text", event.title);
  }

  if (event.description) {
    params.append("details", event.description);
  }

  if (event.location) {
    params.append("location", event.location);
  }

  if (event.startDate && event.endDate) {
    const startDateFormatted = formatDateForGoogleCalendar(event.startDate);
    const endDateFormatted = formatDateForGoogleCalendar(event.endDate);
    params.append("dates", `${startDateFormatted}/${endDateFormatted}`);
  } else if (event.startDate) {
    const startDateFormatted = formatDateForGoogleCalendar(event.startDate);
    const endDate = new Date(event.startDate.getTime() + 60 * 60 * 1000);
    const endDateFormatted = formatDateForGoogleCalendar(endDate);
    params.append("dates", `${startDateFormatted}/${endDateFormatted}`);
  }

  return `${baseUrl}&${params.toString()}`;
}

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
    window.open(
      "https://calendar.google.com/calendar/render?action=TEMPLATE",
      "_blank",
      "noopener,noreferrer"
    );
  }
}
