import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  generateSignedImageUrl,
  extractKeyFromR2Url,
  extractBucketFromR2Url,
} from "@/lib/r2-utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL de l'image requise" },
        { status: 400 }
      );
    }

    const key = extractKeyFromR2Url(imageUrl);

    if (!key) {
      return NextResponse.json({ error: "URL R2 invalide" }, { status: 400 });
    }

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

    const signedUrl = await generateSignedImageUrl(targetBucket, key, 15 * 60);

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn: 15 * 60,
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
