"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";

interface DeleteEventModalProps {
  eventSlug: string;
  eventTitle: string;
  children?: React.ReactNode;
}

export default function DeleteEventModal({
  eventSlug,
  eventTitle,
  children,
}: DeleteEventModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isConfirmationValid = confirmationText === eventSlug;

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      toast.error(
        "Veuillez confirmer la suppression en tapant le slug de l'événement."
      );
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/dashboard/events/${eventSlug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("La suppression a échoué.");
      }

      toast.success("Événement supprimé avec succès !");
      setIsOpen(false);
      router.push(`/dashboard/events/details/${eventSlug}`);
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'événement.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isDeleting) {
      setIsOpen(open);
      if (!open) {
        setConfirmationText("");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="destructive" className="gap-2">
            <IconTrash className="h-4 w-4" />
            Supprimer l'événement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-destructive">
            <IconAlertTriangle className="h-5 w-5" />
            Supprimer définitivement l'événement
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 pt-2">
            <p>
              Cette action est <strong>définitive et irréversible</strong>.
              Toutes les données associées à cet événement seront perdues.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium block">
              Pour confirmer, tapez{" "}
              <code className="px-1.5 py-0.5 bg-muted rounded font-mono text-sm text-foreground">
                {eventSlug}
              </code>{" "}
              ci-dessous :
            </Label>
            <Input
              id="confirmation"
              type="text"
              placeholder={`Tapez ${eventSlug} pour confirmer`}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={isDeleting}
              className={
                confirmationText && !isConfirmationValid
                  ? "border-destructive text-center"
                  : "text-center"
              }
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-sm text-destructive">
                Le texte saisi ne correspond pas au slug requis.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !isConfirmationValid}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Suppression...
              </>
            ) : (
              <>
                <IconTrash className="h-4 w-4" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
