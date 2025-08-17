"use client";

import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { StepProps } from "../../../../../../types/steps";
import { CloudflareImageUpload } from "@/components/ui/cloudflare-image-upload";

export default function Step3({ next, prev, setFormData }: StepProps) {
  const handleNext = () => {
    if (next) next();
  };

  const handlePrev = () => {
    if (prev) prev();
  };

  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Ajoutez une photo de profil pour votre organisation
      </h2>
      <CloudflareImageUpload
        onImageUploaded={handleImageUploaded}
        type="organization"
        maxFileSize={5}
      />
      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrev}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Précédent
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
