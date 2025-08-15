"use client";

import { StepProps } from "../../../../types/steps";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";

export default function Step3({ next, prev, setFormData }: StepProps) {
  const handleNext = () => {
    if (next) next();
  };

  const handlePrev = () => {
    if (prev) prev();
  };

  const handleImageChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      file: file || undefined,
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Ajoutez une photo de profil pour votre organisation
      </h2>
      <ImageUploadZone onImageChange={handleImageChange} maxFileSize={5} />
      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrev}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Précedent
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all duration-200"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
