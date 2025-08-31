import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  generateSignedImageUrl,
  extractKeyFromR2Url,
  extractBucketFromR2Url,
} from "@/lib/r2-utils";

/**
 * @param Route pour régénérer une URL signée pour une image R2
 *
 * Génère automatiquement une nouvelle URL signée valide pour 15 minutes
 * à chaque requête, permettant un affichage continu des images.
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl } = body;

    // Validation des paramètres
    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL de l'image requise" },
        { status: 400 }
      );
    }

    // Extraction de la clé depuis l'URL R2
    const key = extractKeyFromR2Url(imageUrl);

    if (!key) {
      return NextResponse.json({ error: "URL R2 invalide" }, { status: 400 });
    }

    // Utilisation du bucket par défaut
    const targetBucket = process.env.R2_BUCKET;

    if (!targetBucket) {
      return NextResponse.json(
        { error: "Configuration bucket manquante" },
        { status: 500 }
      );
    }

    console.log("Régénération d'URL signée:", {
      bucketName: targetBucket,
      key,
      originalUrl: imageUrl,
    });

    // Génération d'une nouvelle URL signée valide 15 minutes
    const signedUrl = await generateSignedImageUrl(targetBucket, key, 15 * 60);

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn: 15 * 60, // 15 minutes
      originalUrl: imageUrl,
    });
  } catch (error) {
    console.error("Erreur lors de la régénération de l'URL signée:", error);

    return NextResponse.json(
      { error: "Erreur lors de la génération de l'URL signée" },
      { status: 500 }
    );
  }
}
