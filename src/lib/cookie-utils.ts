export function setCookie(
  name: string,
  value: string,
  days: number = 365
): void {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split(";");
  const cookie = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`));

  return cookie ? cookie.split("=")[1] : null;
}

export function deleteCookie(name: string): void {
  if (typeof window === "undefined") return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

export function hasCookieValue(name: string, expectedValue: string): boolean {
  const value = getCookie(name);
  return value === expectedValue;
}
