"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

/**
 * @param userUid - L'UID unique de l'utilisateur
 *
 * Génère un token JWT pour l'authentification
 */
export async function generateToken(userUid: string) {
  return jwt.sign({ userUid }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * @param token - Le token JWT à vérifier
 *
 * Vérifie et décode un token JWT
 */
export async function verifyToken(
  token: string
): Promise<{ userUid: string } | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as { userUid: string };
  } catch {
    return null;
  }
}

/**
 * Récupère l'utilisateur actuellement connecté via le token
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.userUid) return null;

  const user = await prisma.user.findUnique({
    where: { uid: payload.userUid },
  });

  return user;
}

/**
 * Vérifie si un utilisateur a accès à une organisation (propriétaire OU membre)
 * @param userUid - L'UID de l'utilisateur
 * @param organizationId - L'ID de l'organisation
 * @returns true si l'utilisateur a accès, false sinon
 */
export async function hasOrganizationAccess(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  try {
    // Vérifier si l'utilisateur est propriétaire
    const isOwner = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerUid: userUid,
      },
    });

    if (isOwner) {
      return true;
    }

    // Vérifier si l'utilisateur est membre
    const isMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId,
          userUid,
        },
      },
    });

    return !!isMember;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification d'accès à l'organisation:",
      error
    );
    return false;
  }
}

/**
 * Vérifie si un utilisateur est propriétaire d'une organisation
 * @param userUid - L'UID de l'utilisateur
 * @param organizationId - L'ID de l'organisation
 * @returns true si l'utilisateur est propriétaire, false sinon
 */
export async function isOrganizationOwner(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  try {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerUid: userUid,
      },
    });

    return !!organization;
  } catch (error) {
    console.error("Erreur lors de la vérification de propriété:", error);
    return false;
  }
}
