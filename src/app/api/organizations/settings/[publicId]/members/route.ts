import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { publicId } = params;

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
     * Vérification que l'utilisateur est membre de l'organisation
     */
    const userMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: organization.id,
          userUid: session.user.uid,
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    /**
     * Récupération des membres de l'organisation
     */
    const members = await prisma.organizationMember.findMany({
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
      orderBy: [
        { role: "asc" }, // OWNER en premier, puis ADMIN, puis MEMBER
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({
      members: members.map((member) => ({
        id: member.id,
        userUid: member.userUid,
        organizationId: member.organizationId,
        role: member.role,
        createdAt: member.createdAt,
        user: member.user,
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
