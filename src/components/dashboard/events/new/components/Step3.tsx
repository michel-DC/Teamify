"use client";

import { EventFormData } from "../../../../../types/steps-event-creation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { EventStatus } from "@prisma/client";
import { calculateEventStatus } from "@/lib/event-status-utils";
import { Badge } from "@/components/ui/badge";
import React from "react";

interface Step3Props {
  formData: EventFormData;
  updateFormData: (data: Partial<EventFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isStepComplete: boolean;
}

/**
 * @param Mappage des statuts d'événements vers des labels français avec première lettre majuscule
 */
const statusLabels: Record<EventStatus, string> = {
  A_VENIR: "À venir",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

export function Step3({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isStepComplete,
}: Step3Props) {
  // Calcul automatique du statut basé sur les dates
  const calculatedStatus =
    formData.startDate && formData.endDate
      ? calculateEventStatus(formData.startDate, formData.endDate)
      : EventStatus.A_VENIR;

  // Mise à jour automatique du statut dans le formulaire
  React.useEffect(() => {
    if (
      formData.startDate &&
      formData.endDate &&
      formData.status !== calculatedStatus
    ) {
      updateFormData({ status: calculatedStatus });
    }
  }, [
    formData.startDate,
    formData.endDate,
    calculatedStatus,
    formData.status,
    updateFormData,
  ]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Capacité et budget</h2>
        <p className="text-muted-foreground">
          Définissez la capacité d'accueil et le budget de votre événement
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="capacity">Capacité d'accueil *</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="Nombre de participants"
              value={formData.capacity}
              onChange={(e) => updateFormData({ capacity: e.target.value })}
              className="mt-1"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="budget">Budget (en €) *</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Montant en euros"
              value={formData.budget}
              onChange={(e) => updateFormData({ budget: e.target.value })}
              className="mt-1"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Affichage du statut calculé automatiquement */}
        <div className="space-y-2">
          <Label>Statut de l'événement</Label>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Badge variant="outline" className="text-sm">
              {statusLabels[calculatedStatus]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Statut calculé automatiquement selon les dates définies
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrev}>
          Retour
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!isStepComplete}
          className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white border border-[#7C3AED] shadow-lg"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
