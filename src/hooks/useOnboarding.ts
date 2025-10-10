"use client";

import { useState, useEffect } from "react";
import { getCookie, setCookie, hasCookieValue } from "@/lib/cookie-utils";

interface UseOnboardingReturn {
  shouldShowOnboarding: boolean;
  showOnboarding: () => void;
  hideOnboarding: () => void;
  hasSeenOnboarding: boolean;
}

const ONBOARDING_COOKIE_NAME = "hasSeenTheOnboardingPresentation";

export function useOnboarding(): UseOnboardingReturn {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Vérifier le cookie au montage du composant
  useEffect(() => {
    const checkOnboardingStatus = () => {
      // Vérifier si l'utilisateur a déjà vu l'onboarding
      const hasSeen = hasCookieValue(ONBOARDING_COOKIE_NAME, "true");

      setHasSeenOnboarding(hasSeen);
      setShouldShowOnboarding(!hasSeen);
    };

    // Attendre que le DOM soit prêt
    if (typeof window !== "undefined") {
      checkOnboardingStatus();
    }
  }, []);

  const showOnboarding = () => {
    setShouldShowOnboarding(true);
  };

  const hideOnboarding = () => {
    setShouldShowOnboarding(false);
    // Marquer comme vu dans les cookies
    setCookie(ONBOARDING_COOKIE_NAME, "true", 365); // 1 an
    setHasSeenOnboarding(true);
  };

  return {
    shouldShowOnboarding,
    showOnboarding,
    hideOnboarding,
    hasSeenOnboarding,
  };
}
