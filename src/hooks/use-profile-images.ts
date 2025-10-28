import { useState, useEffect, useCallback } from "react";

interface ProfileImage {
  uid: string;
  profileImage: string | null;
}

interface UseProfileImagesReturn {
  profileImages: Record<string, string | null>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProfileImages(userUids: string[]): UseProfileImagesReturn {
  const [profileImages, setProfileImages] = useState<
    Record<string, string | null>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileImages = useCallback(async () => {
    if (userUids.length === 0) {
      setProfileImages({});
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userUidsParam = userUids.join(",");
      const response = await fetch(
        `/api/user/get-all-profiles-images?userUids=${encodeURIComponent(
          userUidsParam
        )}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des images de profil");
      }

      const data = await response.json();

      const imagesMap: Record<string, string | null> = {};
      data.profileImages.forEach((item: ProfileImage) => {
        imagesMap[item.uid] = item.profileImage;
      });

      setProfileImages(imagesMap);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des images de profil:",
        err
      );
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [userUids]);

  useEffect(() => {
    fetchProfileImages();
  }, [fetchProfileImages]);

  return {
    profileImages,
    loading,
    error,
    refetch: fetchProfileImages,
  };
}
