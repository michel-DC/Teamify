"use client";

import Image from "next/image";

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
              src="/images/illustration/empty-conversation.svg"
              alt="Aucune conversation de groupe affichée"
              width={320}
              height={320}
              priority
              className="max-w-[80vw] h-auto"
            />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">
          Bienvenue dans votre groupe de discussion
        </h2>

        <p className="text-muted-foreground mb-4">
          Si rien n&apos;est affiché ici, cliquez sur une conversation dans la
          liste pour l&apos;ouvrir.
        </p>
      </div>
    </div>
  );
};
