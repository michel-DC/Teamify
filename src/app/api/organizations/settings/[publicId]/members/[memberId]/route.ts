import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; memberId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.uid) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { publicId, memberId } = await params;
    const memberIdInt = parseInt(memberId);

    if (isNaN(memberIdInt)) {
      return NextResponse.json(
        { error: "ID de membre invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    /**
     * Récupération de l'organisation par son ID public
     */
    const organization = await prisma.organization.findUnique({
      where: { publicId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur a les permissions pour modifier les rôles
     */
    if (organization.ownerUid === user.uid) {
      // L'utilisateur est le propriétaire, il peut modifier les rôles
    } else {
      // Vérifier si l'utilisateur est membre avec le rôle OWNER
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
          { error: "Seul le propriétaire peut modifier les rôles" },
          { status: 403 }
        );
      }
    }

    /**
     * Vérification que le membre existe
     */
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberIdInt },
    });

    if (!member || member.organizationId !== organization.id) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }

    if (member.role === "OWNER") {
      return NextResponse.json(
        { error: "Impossible de modifier le rôle du propriétaire" },
        { status: 400 }
      );
    }

    /**
     * Mise à jour du rôle
     */
    const updatedMember = await prisma.organizationMember.update({
      where: { id: memberIdInt },
      data: { role },
      include: {
        user: {
          select: {
            uid: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    return NextResponse.json({
      member: {
        id: updatedMember.id,
        userUid: updatedMember.userUid,
        organizationId: updatedMember.organizationId,
        role: updatedMember.role,
        createdAt: updatedMember.createdAt.toISOString(),
        user: updatedMember.user,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la modification du membre:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; memberId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.uid) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { publicId, memberId } = await params;
    const memberIdInt = parseInt(memberId);

    if (isNaN(memberIdInt)) {
      return NextResponse.json(
        { error: "ID de membre invalide" },
        { status: 400 }
      );
    }

    /**
     * Récupération de l'organisation par son ID public
     */
    const organization = await prisma.organization.findUnique({
      where: { publicId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur a les permissions (OWNER ou ADMIN)
     */
    if (organization.ownerUid === user.uid) {
      // L'utilisateur est le propriétaire, il peut supprimer des membres
    } else {
      // Vérifier si l'utilisateur est membre avec un rôle approprié
      const userMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userUid: {
            organizationId: organization.id,
            userUid: user.uid,
          },
        },
      });

      if (
        !userMembership ||
        !["OWNER", "ADMIN"].includes(userMembership.role)
      ) {
        return NextResponse.json(
          { error: "Permissions insuffisantes" },
          { status: 403 }
        );
      }
    }

    /**
     * Vérification que le membre existe
     */
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberIdInt },
    });

    if (!member || member.organizationId !== organization.id) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }

    if (member.role === "OWNER") {
      return NextResponse.json(
        { error: "Impossible de supprimer le propriétaire" },
        { status: 400 }
      );
    }

    /**
     * Suppression du membre
     */
    await prisma.organizationMember.delete({
      where: { id: memberIdInt },
    });

    /**
     * Mise à jour du nombre de membres dans l'organisation
     */
    const memberCount = await prisma.organizationMember.count({
      where: { organizationId: organization.id },
    });

    await prisma.organization.update({
      where: { id: organization.id },
      data: { memberCount },
    });

    return NextResponse.json({
      message: "Membre supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du membre:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
