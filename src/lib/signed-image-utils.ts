/**
 * @param Utilitaires pour la gestion des URLs signées d'images
 */

/**
 * @param Vérification si une URL est déjà signée
 */
export function isSignedUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.searchParams.has("X-Amz-Signature") ||
      urlObj.searchParams.has("X-Amz-Credential") ||
      urlObj.searchParams.has("X-Amz-Date")
    );
  } catch {
    return false;
  }
}

/**
 * @param Extraction du temps restant avant expiration d'une URL signée
 */
export function getTimeUntilExpiration(url: string): number | null {
  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get("X-Amz-Expires");

    if (!expiresParam) return null;

    const expiresIn = parseInt(expiresParam, 10);
    if (isNaN(expiresIn)) return null;

    return expiresIn;
  } catch {
    return null;
  }
}

/**
 * @param Régénération d'une URL signée pour une image
 */
export async function refreshSignedImageUrl(imageUrl: string): Promise<string> {
  const response = await fetch("/api/images/signed-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Erreur de génération");
  }

  return data.signedUrl;
}

/**
 * @param Vérification si une URL signée est proche de l'expiration
 */
export function isUrlNearExpiration(
  url: string,
  thresholdSeconds: number = 60
): boolean {
  const timeRemaining = getTimeUntilExpiration(url);
  return timeRemaining !== null && timeRemaining <= thresholdSeconds;
}

/**
 * @param Génération d'une URL signée avec gestion d'erreur
 */
export async function getSignedImageUrl(
  imageUrl: string | null,
  fallbackUrl?: string
): Promise<string | null> {
  if (!imageUrl) return fallbackUrl || null;

  // Si c'est déjà une URL publique, la retourner directement
  if (!isSignedUrl(imageUrl)) {
    return imageUrl;
  }

  try {
    return await refreshSignedImageUrl(imageUrl);
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL signée:", error);
    return fallbackUrl || imageUrl; // Retourner l'URL originale en cas d'erreur
  }
}
