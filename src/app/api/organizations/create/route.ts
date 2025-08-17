import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OrganizationType } from "@prisma/client";
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
