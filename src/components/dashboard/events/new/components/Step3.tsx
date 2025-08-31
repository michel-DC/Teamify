"use client";

import { EventFormData } from "../../../../../types/steps-event-creation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { EventStatus } from "@prisma/client";

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

        <div>
          <Label htmlFor="status">Statut de l'événement *</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => updateFormData({ status: e.target.value })}
            className="w-full p-2 border rounded-md mt-1 bg-background text-foreground"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrev}>
          Retour
        </Button>
        <Button type="button" onClick={onNext} disabled={!isStepComplete}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
