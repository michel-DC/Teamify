"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export async function generateToken(userUid: string) {
  return jwt.sign({ userUid }, JWT_SECRET, { expiresIn: "7d" });
}

export async function verifyToken(
  token: string
): Promise<{ userUid: string } | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as { userUid: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);

    if (!payload?.userUid) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { uid: payload.userUid },
    });

    return user;
  } catch (error) {
    console.error(
      "[getCurrentUser] Erreur lors de la récupération de l'utilisateur:",
      error
    );
    return null;
  }
}

export async function hasOrganizationAccess(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  try {
    const isOwner = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerUid: userUid,
      },
    });

    if (isOwner) {
      return true;
    }

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

export async function hasOrganizationRole(
  userUid: string,
  organizationId: number,
  requiredRole: "OWNER" | "ADMIN" | "MEMBER"
): Promise<boolean> {
  try {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId,
          userUid,
        },
      },
      select: { role: true },
    });

    if (!member) return false;

    const roleHierarchy = {
      OWNER: 3,
      ADMIN: 2,
      MEMBER: 1,
    };

    const userRoleLevel = roleHierarchy[member.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  } catch (error) {
    console.error("Erreur lors de la vérification du rôle:", error);
    return false;
  }
}

export async function canModifyOrganization(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  return hasOrganizationRole(userUid, organizationId, "ADMIN");
}

export async function canDeleteOrganization(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  return hasOrganizationRole(userUid, organizationId, "OWNER");
}

export async function canModifyEvent(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  return hasOrganizationRole(userUid, organizationId, "ADMIN");
}

export async function canDeleteEvent(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  return hasOrganizationRole(userUid, organizationId, "OWNER");
}

export async function getUserOrganizationRole(
  userUid: string,
  organizationId: number
): Promise<"OWNER" | "ADMIN" | "MEMBER" | null> {
  try {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId,
          userUid,
        },
      },
      select: { role: true },
    });

    return member?.role || null;
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return null;
  }
}

export async function getUserOrganizationRoleByPublicId(
  userUid: string,
  organizationPublicId: string
): Promise<"OWNER" | "ADMIN" | "MEMBER" | null> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { publicId: organizationPublicId },
      select: { id: true, ownerUid: true },
    });

    if (!organization) {
      return null;
    }

    // Vérifier d'abord si l'utilisateur est le propriétaire direct
    if (organization.ownerUid === userUid) {
      return "OWNER";
    }

    // Ensuite, récupérer le rôle de l'utilisateur depuis la table des membres
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: organization.id,
          userUid,
        },
      },
      select: { role: true },
    });

    return member?.role || null;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du rôle par publicId:",
      error
    );
    return null;
  }
}
