import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  generateSignedImageUrl,
  extractKeyFromR2Url,
  extractBucketFromR2Url,
} from "@/lib/r2-utils";

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, expiresIn = 15 * 60 } = body; // 15 minutes par défaut

    // Validation des paramètres
    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL de l'image requise" },
        { status: 400 }
      );
    }

    // Extraction des informations depuis l'URL R2
    const bucketName = extractBucketFromR2Url(imageUrl);
    const key = extractKeyFromR2Url(imageUrl);

    if (!bucketName || !key) {
      return NextResponse.json({ error: "URL R2 invalide" }, { status: 400 });
    }

    // Vérification que l'utilisateur a accès à cette image
    // (optionnel: vérifier les permissions selon le contexte)

    console.log("Génération d'URL signée:", {
      bucketName,
      key,
      expiresIn,
      originalUrl: imageUrl,
    });

    // Génération de l'URL signée
    const signedUrl = await generateSignedImageUrl(bucketName, key, expiresIn);

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn,
      originalUrl: imageUrl,
    });
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL signée:", error);

    return NextResponse.json(
      { error: "Erreur lors de la génération de l'URL signée" },
      { status: 500 }
    );
  }
}
