import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OrganizationType } from "@prisma/client";
import { createNotification } from "@/lib/notification-service";
import { WelcomeEmailService } from "../../../../../emails/services/welcome.service";
import { uploadImage } from "@/lib/upload-utils";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const organizationType = formData.get("organizationType") as OrganizationType;
  const mission = formData.get("mission") as string;
  const memberCount = parseInt(formData.get("memberCount") as string) || 1;
  const imageUrl = formData.get("imageUrl") as string | null;
  const locationRaw = formData.get("location") as string | null;

  // Parse location JSON si fourni
  let location: unknown = null;
  if (locationRaw) {
    try {
      location = JSON.parse(locationRaw);
    } catch {
      return NextResponse.json(
        { error: "Format de localisation invalide" },
        { status: 400 }
      );
    }
  }

  if (!name || !organizationType || !mission) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  // Validation du memberCount
  if (typeof memberCount !== "number" || memberCount < 1) {
    return NextResponse.json(
      { error: "Le nombre de membres doit être au moins 1" },
      { status: 400 }
    );
  }

  try {
    let profileImage = null as string | null;

    if (imageUrl) {
      profileImage = imageUrl;
    }

    /**
     * @param Création de l'organisation avec le propriétaire dans les membres
     *
     * Inclut automatiquement le propriétaire dans la liste des membres avec ses informations complètes
     * et crée une entrée dans OrganizationMember avec le rôle OWNER
     */
    const organization = await prisma.$transaction(async (tx) => {
      // Préparer les données du propriétaire pour la colonne members
      const ownerMember = {
        uid: user.uid,
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email,
      };

      const createdOrg = await tx.organization.create({
        data: {
          name,
          bio,
          profileImage,
          memberCount: 1,
          organizationType,
          mission,
          owner: { connect: { uid: user.uid } },
          location: location as any,
          members: [ownerMember], // Inclure le propriétaire dans les membres
        },
      });

      // Créer l'entrée dans OrganizationMember avec le rôle OWNER
      await tx.organizationMember.create({
        data: {
          userUid: user.uid,
          organizationId: createdOrg.id,
          role: "OWNER",
        },
      });

      await tx.user.update({
        where: { uid: user.uid },
        data: { organizationCount: { increment: 1 } },
      });

      return createdOrg;
    });

    // Créer une notification pour l'utilisateur qui a créé l'organisation
    try {
      await createNotification({
        notificationName: "Organisation créée",
        notificationDescription: `Votre organisation "${organization.name}" a été créée avec succès`,
        notificationType: "SUCCESS",
        eventPublicId: undefined,
        organizationPublicId: organization.publicId || undefined,
        userUid: user.uid,
      });
    } catch (notificationError) {
      console.error(
        "Erreur lors de la création de la notification:",
        notificationError
      );
      // Ne pas faire échouer la création de l'organisation si la notification échoue
    }

    // Envoyer un email de bienvenue si c'est la première organisation de l'utilisateur
    try {
      if (user.organizationCount === 1) {
        const welcomeData = {
          userName:
            `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
            "Utilisateur",
          hasOrganization: true,
          organizationName: organization.name,
          organizationPublicId: organization.publicId || undefined,
        };

        const recipientName =
          `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
          "Utilisateur";

        WelcomeEmailService.sendWelcomeEmailAsync(
          user.email,
          recipientName,
          welcomeData
        );
      }
    } catch (welcomeEmailError) {
      console.error(
        "Erreur lors de l'envoi de l'email de bienvenue:",
        welcomeEmailError
      );
      // Ne pas faire échouer la création de l'organisation si l'email échoue
    }

    return NextResponse.json(
      { message: "Organisation créée", organization },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la création de l'organisation",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
