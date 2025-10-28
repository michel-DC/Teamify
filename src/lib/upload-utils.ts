export interface UploadResponse {
  success: boolean;
  url: string;
  fileName: string;
  expiresIn?: number;
  isSigned?: boolean;
}

export interface UploadError {
  error: string;
}

export interface SignedUrlResponse {
  success: boolean;
  signedUrl: string;
  expiresIn: number;
  originalUrl: string;
}

export async function uploadImage(
  file: File,
  type: "organization" | "event",
  expiresIn: number = 15 * 60
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  formData.append("expiresIn", expiresIn.toString());

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData: UploadError = await response.json();
    throw new Error(errorData.error || "Erreur lors de l'upload");
  }

  const data: UploadResponse = await response.json();
  return data;
}

export async function generateSignedUrlForImage(
  imageUrl: string,
  expiresIn: number = 15 * 60
): Promise<SignedUrlResponse> {
  const response = await fetch("/api/upload/signed-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUrl,
      expiresIn,
    }),
  });

  if (!response.ok) {
    const errorData: UploadError = await response.json();
    throw new Error(
      errorData.error || "Erreur lors de la génération de l'URL signée"
    );
  }

  const data: SignedUrlResponse = await response.json();
  return data;
}

export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): {
  isValid: boolean;
  error?: string;
} {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Type de fichier non supporté. Utilisez JPEG, PNG ou WebP.",
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

export function isSignedUrl(url: string): boolean {
  return url.includes("X-Amz-Algorithm") || url.includes("X-Amz-Signature");
}

export function getTimeUntilExpiration(url: string): number | null {
  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get("X-Amz-Expires");

    if (expiresParam) {
      const expiresIn = parseInt(expiresParam);
      const timestampParam = urlObj.searchParams.get("X-Amz-Date");

      if (timestampParam && expiresIn) {
        const timestamp = new Date(
          timestampParam.replace(
            /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
            "$1-$2-$3T$4:$5:$6Z"
          )
        );
        const expirationTime = new Date(timestamp.getTime() + expiresIn * 1000);
        const now = new Date();

        return Math.max(
          0,
          Math.floor((expirationTime.getTime() - now.getTime()) / 1000)
        );
      }
    }

    return null;
  } catch {
    return null;
  }
}
