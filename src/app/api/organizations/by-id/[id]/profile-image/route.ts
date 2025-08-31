import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasOrganizationAccess } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const organizationPublicId = id;

    if (!organizationPublicId) {
      return NextResponse.json(
        { error: "ID d'organisation invalide" },
        { status: 400 }
      );
    }

    /**
     * Récupération de l'organisation par son publicId
     */
    const organization = await prisma.organization.findFirst({
      where: {
        publicId: organizationPublicId,
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur a accès à l'organisation (propriétaire OU membre)
     */
    const hasAccess = await hasOrganizationAccess(user.uid, organization.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Organisation non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        profileImage: organization.profileImage || null,
        name: organization.name || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération de l'image de profil",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'image" },
      { status: 500 }
    );
  }
}
