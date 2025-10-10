"use client";

import { EventFormData } from "../../../../../types/steps-event-creation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { EventCategory } from "@prisma/client";

interface Step1Props {
  formData: EventFormData;
  updateFormData: (data: Partial<EventFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isStepComplete: boolean;
  eventCode?: string;
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

export function Step1({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isStepComplete,
  eventCode,
}: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Informations de base</h2>
        <p className="text-muted-foreground">
          Commençons par les informations essentielles de votre événement
        </p>
      </div>

      {/* Affichage du code d'événement */}
      {eventCode && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Code de l'événement
              </Label>
              <div className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-2xl font-mono font-black text-[#7C3AED] tracking-wider items-center justify-center">
                {eventCode}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Ce code sera utilisé pour identifier votre événement
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Titre de l'événement *</Label>
          <Input
            id="title"
            placeholder="Ex: Réunion d'équipe mensuelle"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Décrivez votre événement en détail..."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => updateFormData({ category: e.target.value })}
            className="w-full p-2 border rounded-md mt-1 bg-background text-foreground"
          >
            {Object.values(EventCategory).map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={true} // Première étape, pas de retour possible
        >
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
