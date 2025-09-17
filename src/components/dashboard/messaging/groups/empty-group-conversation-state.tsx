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
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center flex flex-col items-center">
        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            <Image
              src="/images/svg/empty.svg"
              alt="Aucune conversation de groupe affichée"
              width={320}
              height={320}
              priority
              className="max-w-[80vw] h-auto"
            />
            <div className="absolute -top-2 -right-2 bg-primary/10 rounded-full p-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">
          Bienvenue dans votre groupe de discussion
        </h2>
        <p className="text-muted-foreground mb-4">
          Cette conversation de groupe permet à tous les membres de votre
          organisation de communiquer ensemble en temps réel.
        </p>
      </div>
    </div>
  );
};
