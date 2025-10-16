import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateSignedImageUrl } from "@/lib/r2-utils";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY ||
      !process.env.R2_ENDPOINT ||
      !process.env.R2_BUCKET
    ) {
      return NextResponse.json(
        { error: "Configuration R2 manquante" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("profileImage") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "L'image ne doit pas dépasser 5MB" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `users/${currentUser.uid}/profile-${timestamp}-${randomId}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(uploadCommand);

    const signedUrl = await generateSignedImageUrl(
      process.env.R2_BUCKET!,
      fileName,
      15 * 60
    );

    const updatedUser = await prisma.user.update({
      where: { uid: currentUser.uid },
      data: {
        profileImage: signedUrl,
      },
    });

    return NextResponse.json({
      message: "Photo de profil mise à jour avec succès",
      profileImage: signedUrl,
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error: unknown) {
    console.error("Erreur lors de l'upload de la photo de profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de la photo de profil" },
      { status: 500 }
    );
  }
}
