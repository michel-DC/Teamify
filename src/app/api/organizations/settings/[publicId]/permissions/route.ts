import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.uid) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { publicId } = params;

    const organization = await prisma.organization.findUnique({
      where: { publicId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    if (organization.ownerUid === user.uid) {
    } else {
      const userMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userUid: {
            organizationId: organization.id,
            userUid: user.uid,
          },
        },
      });

      if (!userMembership || userMembership.role !== "OWNER") {
        return NextResponse.json(
          { error: "Seul le propriétaire peut voir les permissions" },
          { status: 403 }
        );
      }
    }

    const permissions = await prisma.organizationPermissions.findUnique({
      where: { organizationId: organization.id },
    });

    return NextResponse.json({
      permissions,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des permissions:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.uid) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { publicId } = params;

    const organization = await prisma.organization.findUnique({
      where: { publicId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    if (organization.ownerUid === user.uid) {
    } else {
      const userMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userUid: {
            organizationId: organization.id,
            userUid: user.uid,
          },
        },
      });

      if (!userMembership || userMembership.role !== "OWNER") {
        return NextResponse.json(
          { error: "Seul le propriétaire peut créer les permissions" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      adminsCanModifyEvents,
      adminsCanDeleteEvents,
      adminsCanInviteEventParticipants,
      adminsCanInviteMembers,
      adminsCanModifyOrg,
      membersCanInviteEventParticipants,
      membersCanInviteMembers,
    } = body;

    const permissions = await prisma.organizationPermissions.create({
      data: {
        organizationId: organization.id,
        adminsCanModifyEvents: adminsCanModifyEvents ?? true,
        adminsCanDeleteEvents: adminsCanDeleteEvents ?? true,
        adminsCanInviteEventParticipants:
          adminsCanInviteEventParticipants ?? true,
        adminsCanInviteMembers: adminsCanInviteMembers ?? true,
        adminsCanModifyOrg: adminsCanModifyOrg || false,
        membersCanInviteEventParticipants:
          membersCanInviteEventParticipants || false,
        membersCanInviteMembers: membersCanInviteMembers || false,
      },
    });

    return NextResponse.json({
      permissions,
    });
  } catch (error) {
    console.error("Erreur lors de la création des permissions:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.uid) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { publicId } = params;

    const organization = await prisma.organization.findUnique({
      where: { publicId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    if (organization.ownerUid === user.uid) {
    } else {
      const userMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userUid: {
            organizationId: organization.id,
            userUid: user.uid,
          },
        },
      });

      if (!userMembership || userMembership.role !== "OWNER") {
        return NextResponse.json(
          { error: "Seul le propriétaire peut modifier les permissions" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      adminsCanModifyEvents,
      adminsCanDeleteEvents,
      adminsCanInviteEventParticipants,
      adminsCanInviteMembers,
      adminsCanModifyOrg,
      membersCanInviteEventParticipants,
      membersCanInviteMembers,
    } = body;

    const permissions = await prisma.organizationPermissions.update({
      where: { organizationId: organization.id },
      data: {
        adminsCanModifyEvents: adminsCanModifyEvents ?? true,
        adminsCanDeleteEvents: adminsCanDeleteEvents ?? true,
        adminsCanInviteEventParticipants:
          adminsCanInviteEventParticipants ?? true,
        adminsCanInviteMembers: adminsCanInviteMembers ?? true,
        adminsCanModifyOrg: adminsCanModifyOrg || false,
        membersCanInviteEventParticipants:
          membersCanInviteEventParticipants || false,
        membersCanInviteMembers: membersCanInviteMembers || false,
      },
    });

    return NextResponse.json({
      permissions,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des permissions:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
