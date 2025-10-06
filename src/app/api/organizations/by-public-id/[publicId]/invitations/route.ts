import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasOrganizationAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Route pour récupérer les invitations d'une organisation via son publicId
 * Vérifie que l'utilisateur connecté a les permissions pour voir les invitations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    console.log(
      "API Invitations: Début de la requête pour publicId:",
      publicId
    );

    if (!publicId) {
      console.log("API Invitations: PublicId manquant");
      return NextResponse.json(
        { error: "PublicId d'organisation requis" },
        { status: 400 }
      );
    }

    // Vérification de l'authentification
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérification que l'organisation existe via son publicId
    const organization = await prisma.organization.findUnique({
      where: { publicId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Vérification que l'utilisateur a accès à l'organisation (propriétaire OU membre)
    const hasAccess = await hasOrganizationAccess(user.uid, organization.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Vous n'avez pas les permissions pour voir les invitations" },
        { status: 403 }
      );
    }

    // Récupération des invitations de l'organisation
    const invitations = await prisma.organizationInvite.findMany({
      where: { organizationId: organization.id },
      include: {
        invitedBy: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(
      "API Invitations: Retour de",
      invitations.length,
      "invitations"
    );
    return NextResponse.json({
      success: true,
      invitations,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des invitations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
