"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { EventStatus } from "@prisma/client";
import { ArrowLeft, Save } from "lucide-react";

/**
 * Mappage des statuts d'événements vers des labels français
 */
const statusLabels: Record<EventStatus, string> = {
  A_VENIR: "À venir",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

interface EventData {
  title: string;
  status: EventStatus;
}

export function StatusEditForm() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(
    EventStatus.A_VENIR
  );

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/dashboard/events/${params.slug}`);
        const data = await response.json();

        if (response.ok) {
          const event = data.event;
          setEventData({
            title: event.title,
            status: event.status,
          });
          setSelectedStatus(event.status);
        } else {
          toast.error(data.error || "Événement non trouvé");
          router.push("/dashboard/events");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'événement:", error);
        toast.error("Erreur lors du chargement de l'événement");
        router.push("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchEvent();
    }
  }, [params.slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/dashboard/events/${params.slug}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: selectedStatus,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Statut de l'événement modifié avec succès 🎉");
        router.push(`/dashboard/events/details/${params.slug}`);
      } else {
        toast.error(result.error || "Erreur lors de la modification du statut");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/events/edit/${params.slug}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Événement non trouvé</p>
          <Button onClick={() => router.push("/dashboard/events")}>
            Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Modifier le statut de l'événement
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {eventData.title}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Sélection du statut */}
              <div className="space-y-4">
                <Label htmlFor="status" className="text-base font-medium">
                  Statut de l'événement *
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as EventStatus)
                  }
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Le statut actuel est :{" "}
                  <strong>{statusLabels[eventData.status]}</strong>
                </p>
              </div>

              {/* Informations sur les statuts */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium">Informations sur les statuts :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • <strong>À venir</strong> : L'événement est programmé
                  </li>
                  <li>
                    • <strong>En cours</strong> : L'événement se déroule
                    actuellement
                  </li>
                  <li>
                    • <strong>Terminé</strong> : L'événement s'est terminé
                  </li>
                  <li>
                    • <strong>Annulé</strong> : L'événement a été annulé
                  </li>
                </ul>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-base"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au menu
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base bg-[#7C3AED] text-white hover:bg-[#7C3AED]/80 border border-[#7C3AED] shadow-lg"
                  disabled={isSubmitting || selectedStatus === eventData.status}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting
                    ? "Modification en cours..."
                    : "Modifier le statut"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
