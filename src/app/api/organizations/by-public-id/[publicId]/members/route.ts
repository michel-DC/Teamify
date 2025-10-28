import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createNotificationForOrganizationOwnersAndAdmins } from "@/lib/notification-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { publicId } = await params;

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID d'organisation invalide" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { publicId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    const userMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: organization.id,
          userUid: user.uid,
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "Organisation non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    const organizationMembers = await prisma.organizationMember.findMany({
      where: { organizationId: organization.id },
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
      orderBy: { createdAt: "asc" },
    });

    const members = organizationMembers.map((member) => ({
      id: member.id,
      userUid: member.userUid,
      organizationId: member.organizationId,
      role: member.role,
      createdAt: member.createdAt.toISOString(),
      user: member.user,
    }));

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des membres" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { publicId } = await params;
    const body = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID d'organisation invalide" },
        { status: 400 }
      );
    }

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

      if (
        !userMembership ||
        !["OWNER", "ADMIN"].includes(userMembership.role)
      ) {
        return NextResponse.json(
          {
            error:
              "Seul le propriétaire ou un administrateur peut ajouter des membres",
          },
          { status: 403 }
        );
      }
    }

    const { userUid, role = "MEMBER" } = body;

    if (!userUid) {
      return NextResponse.json(
        { error: "UID de l'utilisateur requis" },
        { status: 400 }
      );
    }

    const userToAdd = await prisma.user.findUnique({
      where: { uid: userUid },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: organization.id,
          userUid: userUid,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "L'utilisateur est déjà membre de cette organisation" },
        { status: 400 }
      );
    }

    const newMember = await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userUid: userUid,
        role: role as "OWNER" | "ADMIN" | "MEMBER",
      },
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

    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        memberCount: {
          increment: 1,
        },
      },
    });

    try {
      await createNotificationForOrganizationOwnersAndAdmins(organization.id, {
        notificationName: "Nouveau membre ajouté à l'organisation",
        notificationDescription: `${
          userToAdd.firstname || userToAdd.email
        } a été ajouté(e) à l'organisation "${
          organization.name
        }" avec le rôle ${role}.`,
        notificationType: "INFO",
      });

      console.log(
        `Notifications créées pour les OWNER/ADMIN de l'organisation ${organization.id} - nouveau membre ajouté: ${userUid}`
      );
    } catch (notificationError) {
      console.error(
        "Erreur lors de la création des notifications pour les OWNER/ADMIN:",
        notificationError
      );
    }

    return NextResponse.json(
      {
        message: "Membre ajouté avec succès",
        member: {
          id: newMember.id,
          userUid: newMember.userUid,
          organizationId: newMember.organizationId,
          role: newMember.role,
          createdAt: newMember.createdAt.toISOString(),
          user: newMember.user,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'ajout du membre" },
      { status: 500 }
    );
  }
}
