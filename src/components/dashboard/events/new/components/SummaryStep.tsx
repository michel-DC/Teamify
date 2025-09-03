"use client";

import { EventFormData } from "../../../../../types/steps-event-creation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCategory, EventStatus } from "@prisma/client";

interface SummaryStepProps {
  formData: EventFormData;
  updateFormData: (data: Partial<EventFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isStepComplete: boolean;
  onComplete: (data: EventFormData) => void;
  onCancel: () => void;
}

/**
 * @param Mappage des catégories d'événements vers des labels français
 */
const categoryLabels: Record<EventCategory, string> = {
  REUNION: "Réunion",
  SEMINAIRE: "Séminaire",
  CONFERENCE: "Conférence",
  FORMATION: "Formation",
  ATELIER: "Atelier",
  NETWORKING: "Networking",
  CEREMONIE: "Cérémonie",
  EXPOSITION: "Exposition",
  CONCERT: "Concert",
  SPECTACLE: "Spectacle",
  AUTRE: "Autre",
};

/**
 * @param Mappage des statuts d'événements vers des labels français
 */
const statusLabels: Record<EventStatus, string> = {
  A_VENIR: "À venir",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

export function SummaryStep({
  formData,
  onPrev,
  onComplete,
  onCancel,
}: SummaryStepProps) {
  /**
   * Formate une date pour l'affichage
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Formate le budget pour l'affichage
   */
  const formatBudget = (budget: string) => {
    if (!budget) return "Non défini";
    return `${parseFloat(budget).toLocaleString("fr-FR")} €`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Récapitulatif</h2>
        <p className="text-muted-foreground">
          Vérifiez les informations avant de créer votre événement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations de base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Titre :</span>
              <p className="text-sm text-muted-foreground">{formData.title}</p>
            </div>
            <div>
              <span className="font-medium">Description :</span>
              <p className="text-sm text-muted-foreground">
                {formData.description}
              </p>
            </div>
            <div>
              <span className="font-medium">Catégorie :</span>
              <Badge variant="secondary" className="ml-2">
                {categoryLabels[formData.category]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dates et lieu */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dates et lieu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Début :</span>
              <p className="text-sm text-muted-foreground">
                {formatDate(formData.startDate)}
              </p>
            </div>
            <div>
              <span className="font-medium">Fin :</span>
              <p className="text-sm text-muted-foreground">
                {formatDate(formData.endDate)}
              </p>
            </div>
            <div>
              <span className="font-medium">Lieu :</span>
              <p className="text-sm text-muted-foreground">
                {formData.location}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Capacité et budget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capacité et budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Capacité :</span>
              <p className="text-sm text-muted-foreground">
                {formData.capacity} participants
              </p>
            </div>
            <div>
              <span className="font-medium">Budget :</span>
              <p className="text-sm text-muted-foreground">
                {formatBudget(formData.budget)}
              </p>
            </div>
            <div>
              <span className="font-medium">Statut :</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="ml-2">
                  {statusLabels[formData.status]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (calculé automatiquement)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Visibilité :</span>
              <Badge
                variant={formData.isPublic ? "default" : "secondary"}
                className="ml-2"
              >
                {formData.isPublic ? "Public" : "Privé"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Image :</span>
              <p className="text-sm text-muted-foreground">
                {formData.image ? "Image sélectionnée" : "Aucune image"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrev}>
          Retour
        </Button>
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="button" onClick={() => onComplete(formData)}>
            Créer l'événement
          </Button>
        </div>
      </div>
    </div>
  );
}
