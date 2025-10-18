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

  useEffect(() => {
    const checkOnboardingStatus = () => {
      const hasSeen = hasCookieValue(ONBOARDING_COOKIE_NAME, "true");

      setHasSeenOnboarding(hasSeen);
      setShouldShowOnboarding(!hasSeen);
    };

    if (typeof window !== "undefined") {
      checkOnboardingStatus();
    }
  }, []);

  const showOnboarding = () => {
    setShouldShowOnboarding(true);
  };

  const hideOnboarding = () => {
    setShouldShowOnboarding(false);
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
