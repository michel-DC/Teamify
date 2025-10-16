import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getCurrentUser } from "@/lib/auth";
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

const validateImageFile = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  return allowedTypes.includes(file.type);
};

const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * @param Génération d'un nom de fichier unique
 */
const generateFileName = (originalName: string, type: string): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${type}/${timestamp}-${randomId}.${extension}`;
};

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérification des variables d'environnement
    if (
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY ||
      !process.env.R2_ENDPOINT ||
      !process.env.R2_BUCKET
    ) {
      console.error("Variables d'environnement R2 manquantes:", {
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
        hasEndpoint: !!process.env.R2_ENDPOINT,
        hasBucket: !!process.env.R2_BUCKET,
      });
      return NextResponse.json(
        { error: "Configuration R2 manquante" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "organization" ou "event"
    const expiresIn = parseInt(formData.get("expiresIn") as string) || 15 * 60; // 15 minutes par défaut

    // Validation des paramètres
    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (!type || !["organization", "event"].includes(type)) {
      return NextResponse.json(
        {
          error: "Type de fichier invalide. Utilisez 'organization' ou 'event'",
        },
        { status: 400 }
      );
    }

    // Validation du fichier
    if (!validateImageFile(file)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Utilisez JPEG, PNG ou WebP" },
        { status: 400 }
      );
    }

    if (!validateFileSize(file)) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Taille maximale: 10MB" },
        { status: 400 }
      );
    }

    // Conversion du fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Génération du nom de fichier unique
    const fileName = generateFileName(file.name, type);

    console.log("Tentative d'upload vers R2:", {
      bucket: process.env.R2_BUCKET,
      fileName,
      fileSize: buffer.length,
      contentType: file.type,
    });

    // Upload vers Cloudflare R2 (fichier privé)
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // Pas de CacheControl pour les fichiers privés
    });

    await s3Client.send(uploadCommand);

    console.log("Upload réussi:", { fileName });

    // Génération de l'URL signée
    const signedUrl = await generateSignedImageUrl(
      process.env.R2_BUCKET!,
      fileName,
      expiresIn
    );

    console.log("URL signée générée:", { fileName, expiresIn });

    return NextResponse.json({
      success: true,
      url: signedUrl,
      fileName: fileName,
      expiresIn: expiresIn,
      isSigned: true,
    });
  } catch (error) {
    console.error("Erreur détaillée lors de l'upload:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}
