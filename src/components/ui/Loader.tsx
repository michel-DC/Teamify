import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loader({ className, size = "md", text }: LoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoadingScreenProps {
  text?: string;
  className?: string;
}

export function LoadingScreen({
  text = "Chargement...",
  className,
}: LoadingScreenProps) {
  const loadingMessages = [
    "Préparation de votre espace de travail... 🚀",
    "Assemblage de votre équipe de rêve... 👥",
    "Chargement de la magie collaborative... ✨",
    "Préparation de votre café virtuel... ☕",
    "Optimisation de votre productivité... 📈",
    "Synchronisation des cerveaux créatifs... 🧠",
    "Chargement de l'innovation... 💡",
    "Préparation de votre succès... 🎯",
  ];

  const [randomMessage, setRandomMessage] = useState("Chargement...");

  useEffect(() => {
    // Sélection aléatoire uniquement côté client pour éviter l'erreur d'hydratation
    const selectedMessage =
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    setRandomMessage(selectedMessage);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#7C3AED] border-r-[#7C3AED] rounded-full animate-spin"></div>

          <div className="w-16 h-16 flex items-center justify-center bg-transparent">
            <Image
              src="/images/logo/favicon.svg"
              alt="Teamify - Plateforme de gestion d'équipe"
              width={40}
              height={40}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            {text === "Chargement..." ? randomMessage : text}
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
