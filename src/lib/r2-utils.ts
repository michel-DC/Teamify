import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * @param Configuration du client S3 pour Cloudflare R2
 */
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

/**
 * @param Types pour les URLs signées
 */
export interface SignedUrlOptions {
  expiresIn?: number; // Durée de validité en secondes (défaut: 15 minutes)
  contentType?: string; // Type de contenu pour les headers
  responseContentType?: string; // Type de réponse forcé
  responseContentDisposition?: string; // Disposition de la réponse
}

/**
 * @param Génération d'une URL signée pour un objet R2
 *
 * Crée une URL temporaire permettant d'accéder à un fichier privé
 * dans le bucket R2. L'URL est valide pour la durée spécifiée.
 */
export async function generateSignedUrl(
  bucketName: string,
  key: string,
  options: SignedUrlOptions = {}
): Promise<string> {
  const {
    expiresIn = 15 * 60, // 15 minutes par défaut
    contentType,
    responseContentType,
    responseContentDisposition,
  } = options;

  // Vérification des variables d'environnement
  if (
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_ENDPOINT
  ) {
    throw new Error("Configuration R2 manquante");
  }

  // Préparation de la commande GetObject
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    ...(contentType && { ContentType: contentType }),
    ...(responseContentType && { ResponseContentType: responseContentType }),
    ...(responseContentDisposition && {
      ResponseContentDisposition: responseContentDisposition,
    }),
  });

  try {
    // Génération de l'URL signée
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return signedUrl;
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL signée:", {
      bucketName,
      key,
      error: error instanceof Error ? error.message : error,
    });
    throw new Error("Impossible de générer l'URL signée");
  }
}

/**
 * @param Génération d'une URL signée pour une image
 *
 * Version spécialisée pour les images avec les headers appropriés
 */
export async function generateSignedImageUrl(
  bucketName: string,
  key: string,
  expiresIn: number = 15 * 60
): Promise<string> {
  return generateSignedUrl(bucketName, key, {
    expiresIn,
    responseContentType: "image/*",
    responseContentDisposition: "inline",
  });
}

/**
 * @param Vérification de l'existence d'un objet dans R2
 */
export async function objectExists(
  bucketName: string,
  key: string
): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * @param Extraction du nom de fichier depuis une URL R2
 */
export function extractKeyFromR2Url(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Supprimer le bucket name et récupérer le reste du chemin
    if (pathParts.length > 2) {
      return pathParts.slice(2).join("/");
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * @param Extraction du bucket name depuis une URL R2
 */
export function extractBucketFromR2Url(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Le bucket est généralement le premier élément du path
    if (pathParts.length > 1) {
      return pathParts[1];
    }

    return null;
  } catch {
    return null;
  }
}
