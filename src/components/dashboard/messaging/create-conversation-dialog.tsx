"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, User, Search } from "lucide-react";
import { toast } from "sonner";

interface CreateConversationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
  onConversationCreatedCallback?: () => void;
}

/**
 * Dialog pour créer une nouvelle conversation responsive
 */
export const CreateConversationDialog = ({
  isOpen,
  onOpenChange,
  onConversationCreated,
  onConversationCreatedCallback,
}: CreateConversationDialogProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<any>(null);

  const { createConversation } = useConversations({ autoFetch: true });

  /**
   * Rechercher un utilisateur par email
   */
  const searchUserByEmail = async () => {
    if (!email.trim()) {
      setError("Veuillez entrer un email");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFoundUser(null);

    try {
      const response = await fetch(
        `/api/users/search?email=${encodeURIComponent(email.trim())}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("Aucun utilisateur trouvé avec cet email");
        } else {
          setError("Erreur lors de la recherche de l'utilisateur");
        }
        return;
      }

      const userData = await response.json();
      setFoundUser(userData);
    } catch (error) {
      console.error("Erreur recherche utilisateur:", error);
      setError("Erreur lors de la recherche de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vérifier si une conversation privée existe déjà avec cet utilisateur
   */
  const checkExistingPrivateConversation = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/conversations/check-private?userId=${userId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
      return false;
    } catch (error) {
      console.error("Erreur vérification conversation existante:", error);
      return false;
    }
  };

  /**
   * Créer la conversation avec l'utilisateur trouvé
   */
  const createConversationWithUser = async () => {
    if (!foundUser) return;

    setIsLoading(true);
    setError(null);

    try {
      // Vérifier si une conversation privée existe déjà
      const conversationExists = await checkExistingPrivateConversation(
        foundUser.uid
      );

      if (conversationExists) {
        toast.error("Une conversation privée existe déjà avec cette personne");
        setIsLoading(false);
        return;
      }

      const newConversation = await createConversation({
        type: "PRIVATE",
        title: undefined, // Ne pas définir de titre, laisser le système d'affichage gérer
        memberIds: [foundUser.uid],
      });

      if (newConversation) {
        onConversationCreated(newConversation.id);
        // Déclencher le callback de rechargement si fourni
        if (onConversationCreatedCallback) {
          onConversationCreatedCallback();
        }
        // Reset form
        setEmail("");
        setFoundUser(null);
        toast.success("Conversation créée avec succès");
      }
    } catch (error) {
      console.error("Erreur création conversation:", error);
      setError("Erreur lors de la création de la conversation");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fermer le dialog et reset le formulaire
   */
  const handleClose = () => {
    setEmail("");
    setFoundUser(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            Nouvelle conversation
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Entrez l'email de la personne que vous souhaitez contacter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Champ email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      searchUserByEmail();
                    }
                  }}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={searchUserByEmail}
                disabled={isLoading || !email.trim()}
                size="sm"
                className="px-4 py-2 mt-1.5 bg-violet-600 hover:bg-violet-700 text-white border border-violet-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Affichage de l'utilisateur trouvé */}
          {foundUser && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm md:text-base truncate">
                    {foundUser.firstname} {foundUser.lastname}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {foundUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Affichage des erreurs */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto shadow-lg"
          >
            Annuler
          </Button>
          <Button
            onClick={createConversationWithUser}
            disabled={!foundUser || isLoading}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white border border-violet-600 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Création...
              </>
            ) : (
              "Créer la conversation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
