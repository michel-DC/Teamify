import { randomBytes } from "crypto";

export function generateInvitationCode(): string {
  return randomBytes(10).toString("hex");
}

export function encodeInvitationCode(
  invitationId: string,
  eventCode: string
): string {
  return `${invitationId}+${eventCode}`;
}

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

export function isValidInvitationCode(code: string): boolean {
  return decodeInvitationCode(code) !== null;
}
