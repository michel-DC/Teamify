"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!lenisRef.current) {
      lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });
    }

    function raf(time: number) {
      if (lenisRef.current) {
        lenisRef.current.raf(time);
        requestAnimationFrame(raf);
      }
    }

    requestAnimationFrame(raf);

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return {
    lenis: lenisRef.current,
    scrollTo: (target: number | string | HTMLElement, options?: any) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, options);
      }
    },
    stop: () => {
      if (lenisRef.current) {
        lenisRef.current.stop();
      }
    },
    start: () => {
      if (lenisRef.current) {
        lenisRef.current.start();
      }
    },
  };
}
