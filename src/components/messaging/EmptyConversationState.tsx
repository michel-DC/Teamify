"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";

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
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">
          Sélectionnez une conversation
        </h2>
        <p className="text-muted-foreground mb-4">
          Choisissez une conversation existante ou créez-en une nouvelle
        </p>
        <Button onClick={onCreateConversation}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>
    </div>
  );
};
