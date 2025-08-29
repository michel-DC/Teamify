"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EventFormData } from "../../../../../types/steps-event-creation";
import { StepWizard } from "./components/StepWizard";
import { useOrganization } from "@/hooks/useOrganization";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface EventFormProps {
  orgId: string;
}

export function EventForm({ orgId }: EventFormProps) {
  const router = useRouter();
  const { organizations } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [eventCode, setEventCode] = useState<string>("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(true);

  // Trouver l'organisation correspondante à l'orgId
  const selectedOrganization = organizations.find(
    (org) => org.id.toString() === orgId
  );

  /**
   * Génère un code d'événement unique au chargement de la page
   */
  useEffect(() => {
    const generateEventCode = async () => {
      try {
        const response = await fetch("/api/dashboard/events/generate-code");
        if (response.ok) {
          const data = await response.json();
          setEventCode(data.eventCode);
        } else {
          toast.error("Erreur lors de la génération du code");
        }
      } catch (error) {
        toast.error("Erreur réseau lors de la génération du code");
      } finally {
        setIsGeneratingCode(false);
      }
    };

    generateEventCode();
  }, []);

  /**
   * Gère la soumission finale du formulaire
   */
  const handleFormComplete = async (formData: EventFormData) => {
    setIsLoading(true);

    try {
      const submitData = new FormData();

      // Ajout des données du formulaire
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "image" && value !== undefined && value !== null) {
          if (key === "locationCoords" && typeof value === "object") {
            // Convertir les coordonnées en JSON string
            submitData.append(key, JSON.stringify(value));
          } else {
            submitData.append(key, value.toString());
          }
        }
      });

      // Ajout du code d'événement
      if (eventCode) {
        submitData.append("eventCode", eventCode);
      }

      // Ajout de l'image si présente
      if (formData.imageUrl) {
        submitData.append("imageUrl", formData.imageUrl);
      }

      const response = await fetch("/api/dashboard/events", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'événement");
      }

      toast.success("Événement créé avec succès 🤩​");
      router.refresh();
      router.push("/dashboard/events");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Une erreur est survenue lors de la création de l'événement");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gère l'annulation du formulaire
   */
  const handleCancel = () => {
    router.push("/dashboard/events");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Créer un nouvel événement</h1>
        <p className="text-muted-foreground mt-2">
          Suivez les étapes pour créer votre événement
        </p>

        {/* Indicateur de l'organisation sélectionnée */}
        {selectedOrganization && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Organisation :
            </span>
            <Badge variant="secondary" className="font-medium">
              {selectedOrganization.name}
            </Badge>
          </div>
        )}
      </div>

      <StepWizard
        orgId={orgId}
        onComplete={handleFormComplete}
        onCancel={handleCancel}
        eventCode={eventCode}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Création de l'événement en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
}
