"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { IconAlertTriangle } from "@tabler/icons-react";

interface DeleteEventBannerProps {
  eventId: number;
}

export default function DeleteEventBanner({ eventId }: DeleteEventBannerProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/dashboard/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("La suppression a échoué.");
      }

      toast.success("Événement supprimé avec succès !");
      router.push("/dashboard/events");
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'événement.");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Card className="max-w-2xl mx-auto border-red-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-500">
          <IconAlertTriangle stroke={1.5} />
          Supprimer l'événement
        </CardTitle>
        <CardDescription className="pt-2">
          Cette action est définitive et ne peut être annulée. Toutes les
          données associées à cet événement seront perdues.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end gap-2 p-4">
        <Button variant="ghost" onClick={handleCancel} disabled={isDeleting}>
          Annuler
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Suppression en cours..." : "Oui, supprimer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
