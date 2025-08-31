import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    console.log(
      "🔍 [API] Début de la requête GET /api/organizations/by-public-id/[publicId]"
    );

    const user = await getCurrentUser();
    console.log("🔍 [API] Utilisateur récupéré:", {
      hasUser: !!user,
      userEmail: user?.email,
      userUid: user?.uid,
    });

    if (!user) {
      console.log("❌ [API] Pas d'utilisateur connecté");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { publicId } = params;
    console.log("🔍 [API] PublicId reçu:", publicId);

    /**
     * Récupération de l'organisation par son ID public
     */
    const organization = await prisma.organization.findUnique({
      where: { publicId },
      include: {
        owner: {
          select: {
            uid: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    console.log("🔍 [API] Organisation trouvée:", {
      found: !!organization,
      organizationId: organization?.id,
      organizationName: organization?.name,
      ownerUid: organization?.owner?.uid,
    });

    if (!organization) {
      console.log("❌ [API] Organisation non trouvée");
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur est membre de l'organisation
     */
    console.log("🔍 [API] Recherche du membership pour:", {
      organizationId: organization.id,
      userUid: user.uid,
    });

    const userMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: organization.id,
          userUid: user.uid,
        },
      },
    });

    console.log("🔍 [API] Membership trouvé:", {
      found: !!userMembership,
      membershipRole: userMembership?.role,
      membershipId: userMembership?.id,
    });

    if (!userMembership) {
      console.log("❌ [API] Aucun membership trouvé pour cet utilisateur");

      // Log supplémentaire pour debug - vérifier tous les membres de l'organisation
      const allMembers = await prisma.organizationMember.findMany({
        where: { organizationId: organization.id },
        include: { user: { select: { uid: true, email: true } } },
      });
      console.log(
        "🔍 [API] Tous les membres de l'organisation:",
        allMembers.map((m) => ({
          userUid: m.userUid,
          userEmail: m.user.email,
          role: m.role,
        }))
      );

      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    console.log(
      "✅ [API] Accès autorisé, retour des données de l'organisation"
    );

    return NextResponse.json({
      organization: {
        id: organization.id,
        publicId: organization.publicId,
        name: organization.name,
        bio: organization.bio,
        organizationType: organization.organizationType,
        mission: organization.mission,
        profileImage: organization.profileImage,
        memberCount: organization.memberCount,
        eventCount: organization.eventCount,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        owner: organization.owner,
      },
    });
  } catch (error) {
    console.error(
      "❌ [API] Erreur lors de la récupération de l'organisation:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
