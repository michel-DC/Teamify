"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { EventFormData } from "../../../../../../types/steps-event-creation";

interface Step4Props {
  formData: EventFormData;
  updateFormData: (data: Partial<EventFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isStepComplete: boolean;
}

export function Step4({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isStepComplete,
}: Step4Props) {
  const handleImageChange = (file: File | null) => {
    updateFormData({ image: file || undefined });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-center mb-2">
          Image de l&apos;événement
        </h2>
        <p className="text-muted-foreground text-center">
          Ajoutez une image pour rendre votre événement plus attractif
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">
          Image de l&apos;événement
        </Label>
        <ImageUploadZone onImageChange={handleImageChange} maxFileSize={5} />
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
