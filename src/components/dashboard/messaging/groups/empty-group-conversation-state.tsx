"use client";

import Image from "next/image";
import { Users } from "lucide-react";

interface EmptyGroupConversationStateProps {
  onCreateConversation?: () => void;
}

/**
 * État vide quand aucune conversation de groupe n'est sélectionnée - Responsive
 */
export const EmptyGroupConversationState = ({
  onCreateConversation,
}: EmptyGroupConversationStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen p-4">
      <div className="text-center flex flex-col items-center max-w-md">
        <div className="mb-4 md:mb-6 flex items-center justify-center">
          <div className="relative">
            <Image
              src="/images/svg/empty.svg"
              alt="Aucune conversation de groupe affichée"
              width={280}
              height={280}
              priority
              className="max-w-[60vw] md:max-w-[80vw] h-auto"
            />
            <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-primary/10 rounded-full p-1 md:p-2">
              <Users className="h-4 w-4 md:h-6 md:w-6 text-primary" />
            </div>
          </div>
        </div>
        <h2 className="text-lg md:text-xl font-semibold mb-2">
          Bienvenue dans votre groupe de discussion
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mb-4">
          Cette conversation de groupe permet à tous les membres de votre
          organisation de communiquer ensemble en temps réel.
        </p>
      </div>
    </div>
  );
};
