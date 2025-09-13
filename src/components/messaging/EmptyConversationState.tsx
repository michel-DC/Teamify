"use client";

import Image from "next/image";

interface EmptyConversationStateProps {
  onCreateConversation: () => void;
}

/**
 * État vide quand aucune conversation n'est sélectionnée
 */
export const EmptyConversationState = ({
  onCreateConversation,
}: EmptyConversationStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center flex flex-col items-center">
        <div className="mb-6 flex items-center justify-center">
          <Image
            src="/images/svg/empty.svg"
            alt="Aucune conversation affichée"
            width={320}
            height={320}
            priority
            className="max-w-[80vw] h-auto"
          />
        </div>
        <h2 className="text-xl font-semibold mb-2">
          Aucune conversation affichée
        </h2>
        <p className="text-muted-foreground">
          Si rien n&apos;est affiché ici, cliquez sur une conversation dans la
          liste pour l&apos;ouvrir.
        </p>
      </div>
    </div>
  );
};
