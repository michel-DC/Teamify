"use client";

import Image from "next/image";

interface EmptyConversationStateProps {
  onCreateConversation: () => void;
}

/**
 * État vide quand aucune conversation n'est sélectionnée - Responsive
 */
export const EmptyConversationState = ({
  onCreateConversation,
}: EmptyConversationStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen p-4">
      <div className="text-center flex flex-col items-center max-w-md">
        <div className="mb-4 md:mb-6 flex items-center justify-center">
          <Image
            src="/images/svg/empty.svg"
            alt="Aucune conversation affichée"
            width={280}
            height={280}
            priority
            className="max-w-[60vw] md:max-w-[80vw] h-auto"
          />
        </div>
        <h2 className="text-lg md:text-xl font-semibold mb-2">
          Aucune conversation affichée
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Si rien n&apos;est affiché ici, cliquez sur une conversation dans la
          liste pour l&apos;ouvrir.
        </p>
      </div>
    </div>
  );
};
