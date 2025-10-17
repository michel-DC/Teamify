"use client";

import { useLenis } from "@/hooks/use-lenis";
import { ReactNode } from "react";

interface LenisLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LenisLink({ href, children, className, onClick }: LenisLinkProps) {
  const { scrollTo } = useLenis();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        scrollTo(target, {
          offset: -80,
          duration: 1.2,
        });
      }
    } else if (href.startsWith("/")) {
      window.location.href = href;
    } else {
      window.open(href, "_blank");
    }
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
