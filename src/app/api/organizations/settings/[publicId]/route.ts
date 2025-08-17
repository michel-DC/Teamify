import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage } from "@/lib/upload-utils";

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
     * Vérification que l'utilisateur a les permissions pour modifier l'organisation
     */
    // Vérifier d'abord si l'utilisateur est le propriétaire direct
    if (organization.ownerUid === user.uid) {
      // L'utilisateur est le propriétaire, il a tous les droits
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

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const organizationType = formData.get("organizationType") as string;
    const mission = formData.get("mission") as string;
    const profileImage = formData.get("profileImage") as File | null;

    if (!name || !organizationType || !mission) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    let profileImagePath = null;

    /**
     * Traitement de l'image de profil si fournie
     */
    if (profileImage && profileImage.size > 0) {
      try {
        const uploadResult = await uploadImage(profileImage, "organization");
        profileImagePath = uploadResult.url;
      } catch (uploadError) {
        console.error("Erreur lors de l'upload:", uploadError);
        return NextResponse.json(
          { error: "Erreur lors de l'upload de l'image" },
          { status: 500 }
        );
      }
    }

    /**
     * Mise à jour de l'organisation
     */
    const updateData: any = {
      name,
      bio: bio || null,
      organizationType,
      mission,
    };

    if (profileImagePath) {
      updateData.profileImage = profileImagePath;
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: organization.id },
      data: updateData,
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

    return NextResponse.json({
      organization: {
        id: updatedOrganization.id,
        publicId: updatedOrganization.publicId,
        name: updatedOrganization.name,
        bio: updatedOrganization.bio,
        organizationType: updatedOrganization.organizationType,
        mission: updatedOrganization.mission,
        profileImage: updatedOrganization.profileImage,
        memberCount: updatedOrganization.memberCount,
        eventCount: updatedOrganization.eventCount,
        createdAt: updatedOrganization.createdAt,
        updatedAt: updatedOrganization.updatedAt,
        owner: updatedOrganization.owner,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'organisation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.uid) {
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
     * Vérification que l'utilisateur est propriétaire de l'organisation
     */
    // Vérifier d'abord si l'utilisateur est le propriétaire direct
    if (organization.ownerUid === user.uid) {
      // L'utilisateur est le propriétaire, il peut supprimer
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
          { error: "Seul le propriétaire peut supprimer l'organisation" },
          { status: 403 }
        );
      }
    }

    /**
     * Suppression de l'organisation (avec cascade automatique grâce au schéma Prisma)
     */
    await prisma.organization.delete({
      where: { id: organization.id },
    });

    return NextResponse.json({
      message: "Organisation supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'organisation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
