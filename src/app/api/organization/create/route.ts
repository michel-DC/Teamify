import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { OrganizationType } from "@prisma/client";

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
  const file = formData.get("file") as File | null;
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

  try {
    let profileImage = null as string | null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      const path = join(
        process.cwd(),
        "public/uploads/organizations",
        fileName
      );
      await writeFile(path, buffer);
      profileImage = `/uploads/organizations/${fileName}`;
    }

    const organization = await prisma.$transaction(async (tx) => {
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
