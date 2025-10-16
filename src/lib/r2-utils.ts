import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export interface SignedUrlOptions {
  expiresIn?: number;
  contentType?: string;
  responseContentType?: string;
  responseContentDisposition?: string;
}

export async function generateSignedUrl(
  bucketName: string,
  key: string,
  options: SignedUrlOptions = {}
): Promise<string> {
  const {
    expiresIn = 15 * 60,
    contentType,
    responseContentType,
    responseContentDisposition,
  } = options;

  if (
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_ENDPOINT
  ) {
    throw new Error("Configuration R2 manquante");
  }

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

function parseUrlPath(url: string): string[] | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split("/");
  } catch {
    return null;
  }
}

function removeDefaultBucketFromPath(pathParts: string[]): string[] {
  const defaultBucket = process.env.R2_BUCKET;
  if (defaultBucket && pathParts[0] === defaultBucket) {
    return pathParts.slice(1);
  }
  return pathParts;
}

export function extractKeyFromR2Url(url: string): string | null {
  const pathParts = parseUrlPath(url);
  if (!pathParts || pathParts.length <= 2) {
    return null;
  }

  const extractedParts = pathParts.slice(2);
  const finalParts = removeDefaultBucketFromPath(extractedParts);

  return finalParts.join("/");
}

export function extractBucketFromR2Url(url: string): string | null {
  const pathParts = parseUrlPath(url);
  if (!pathParts || pathParts.length <= 1) {
    return null;
  }

  return pathParts[1];
}

export function isR2Url(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return (
      hostname.includes("r2.cloudflarestorage.com") ||
      hostname.includes("r2.dev") ||
      (hostname.includes("cloudflare") && urlObj.pathname.includes("/"))
    );
  } catch {
    return false;
  }
}
