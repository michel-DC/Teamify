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
