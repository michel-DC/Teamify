import { randomBytes } from "crypto";

/**
 * @param Génération d'un code d'invitation sécurisé
 *
 * Crée un code unique de 20 caractères pour identifier une invitation
 */
export function generateInvitationCode(): string {
  return randomBytes(10).toString("hex");
}

/**
 * @param Encodage d'un code d'invitation
 *
 * Combine l'invitationId (CUID) et le code d'événement en un seul code
 */
export function encodeInvitationCode(
  invitationId: string,
  eventCode: string
): string {
  return `${invitationId}+${eventCode}`;
}

/**
 * @param Décodage d'un code d'invitation
 *
 * Extrait l'invitationId (CUID) et le code d'événement du code combiné
 */
export function decodeInvitationCode(
  code: string
): { invitationId: string; eventCode: string } | null {
  const parts = code.split("+");

  if (parts.length !== 2) {
    return null;
  }

  const invitationId = parts[0];
  const eventCode = parts[1];

  if (!invitationId || !eventCode) {
    return null;
  }

  return { invitationId, eventCode };
}

/**
 * @param Validation d'un code d'invitation
 *
 * Vérifie si le format du code d'invitation est valide
 */
export function isValidInvitationCode(code: string): boolean {
  return decodeInvitationCode(code) !== null;
}
