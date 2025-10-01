import { cn } from "@/lib/utils";
import Image from "next/image";

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

/**
 * Écran de chargement plein écran avec logo Teamify et spinner violet
 */
export function LoadingScreen({
  text = "Chargement...",
  className,
}: LoadingScreenProps) {
  const loadingMessages = [
    "Connexion à Google en cours... 🔐",
    "Vérification de votre identité Google... 🕵️‍♂️",
    "Synchronisation avec votre compte Google... 🔄",
    "Authentification sécurisée via Google... 🛡️",
    "Récupération de vos informations Google... 📡",
    "Connexion à votre espace via Google... 🌐",
    "Merci de patienter pendant la connexion Google... ⏳",
    "Presque terminé, finalisation avec Google... ✅",
  ];

  const randomMessage =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Conteneur pour le logo et le spinner */}
        <div className="relative flex items-center justify-center">
          {/* Spinner violet autour du logo */}
          <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#7C3AED] border-r-[#7C3AED] rounded-full animate-spin"></div>

          <div className="w-16 h-16 flex items-center justify-center bg-transparent">
            <Image
              src="/images/logo/google/google.svg"
              alt="Teamify - Plateforme de gestion d'équipe"
              width={40}
              height={40}
            />
          </div>
        </div>

        {/* Texte de chargement avec blague */}
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
