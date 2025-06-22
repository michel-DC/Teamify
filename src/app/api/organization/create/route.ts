import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { OrgSize } from "@prisma/client";

export async function POST(req: Request) {
  // 🔒 Récupère l'utilisateur authentifié depuis le cookie
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const memberCount = formData.get("memberCount") as string;
  const size = formData.get("size") as OrgSize;
  const mission = formData.get("mission") as string;
  const file = formData.get("file") as File;

  if (!name || !bio || !memberCount || !size || !mission) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  try {
    let profileImage = null;

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

    const organization = await prisma.organization.create({
      data: {
        name,
        bio,
        profileImage,
        memberCount: Number(memberCount),
        size,
        mission,
        owner: { connect: { id: user.id } },
      },
    });

    return NextResponse.json(
      {
        message: "Organisation créée",
        organization,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ORGANIZATION_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
