import { useState, useEffect, useCallback, useRef } from "react";

interface UseAutoSignedImageOptions {
  refreshThreshold?: number;
  autoRefresh?: boolean;
  debounceMs?: number;
}

interface UseAutoSignedImageReturn {
  signedUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isSigned: boolean;
}

export function useAutoSignedImage(
  imageUrl: string | null,
  options: UseAutoSignedImageOptions = {}
): UseAutoSignedImageReturn {
  const {
    refreshThreshold = 60,
    autoRefresh = true,
    debounceMs = 300,
  } = options;

  const [signedUrl, setSignedUrl] = useState<string | null>(imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSigned, setIsSigned] = useState(false);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedUrlRef = useRef<string | null>(null);

  const isSignedUrl = useCallback((url: string): boolean => {
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
  }, []);

  const generateFreshSignedUrl = useCallback(async () => {
    if (!imageUrl) {
      setSignedUrl(null);
      setIsSigned(false);
      return;
    }

    if (lastProcessedUrlRef.current === imageUrl && isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    lastProcessedUrlRef.current = imageUrl;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/images/signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!abortControllerRef.current.signal.aborted) {
        if (data.success) {
          setSignedUrl(data.signedUrl);
          setIsSigned(true);
          setError(null);

          if (autoRefresh) {
            scheduleNextRefresh(data.expiresIn);
          }
        } else {
          throw new Error(data.error || "Erreur de génération");
        }
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.warn("Erreur lors de la génération de l'URL signée:", err);
        setError(null);
        setIsSigned(false);
        if (imageUrl) {
          setSignedUrl(imageUrl);
        }
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [imageUrl, isLoading, autoRefresh]);

  const scheduleNextRefresh = useCallback(
    (expiresIn: number) => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      const timeUntilExpiration = expiresIn - refreshThreshold;
      const refreshDelay = Math.max(0, timeUntilExpiration) * 1000;

      refreshTimeoutRef.current = setTimeout(() => {
        generateFreshSignedUrl();
      }, refreshDelay);
    },
    [refreshThreshold, generateFreshSignedUrl]
  );

  const initializeSignedUrl = useCallback(async () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (!imageUrl) {
        setSignedUrl(null);
        setIsSigned(false);
        setError(null);
        return;
      }

      if (isSignedUrl(imageUrl)) {
        setIsSigned(true);
        try {
          await generateFreshSignedUrl();
        } catch {
          setSignedUrl(imageUrl);
          setError(null);
        }
      } else {
        setSignedUrl(imageUrl);
        setIsSigned(false);
        setError(null);
      }
    }, debounceMs);
  }, [imageUrl, isSignedUrl, generateFreshSignedUrl, debounceMs]);

  const refresh = useCallback(async () => {
    await generateFreshSignedUrl();
  }, [generateFreshSignedUrl]);

  useEffect(() => {
    initializeSignedUrl();

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    signedUrl,
    isLoading,
    error,
    refresh,
    isSigned,
  };
}
