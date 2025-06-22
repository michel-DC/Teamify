"use client";

import { StepProps } from "../../../../types/steps";
import Image from "next/image";
import { useState } from "react";

export default function Step3({
  next,
  prev,
  formData,
  setFormData,
}: StepProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (next) next();
  };

  const handlePrev = () => {
    if (prev) prev();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Vérification de la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image");
      return;
    }

    // Création d'une URL pour la prévisualisation
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Stockage du fichier dans formData
    setFormData((prev) => ({
      ...prev,
      file: file,
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Ajoutez une photo de profil pour votre organisation
      </h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {previewUrl && (
        <Image
          src={previewUrl}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-lg border border-border"
          width={128}
          height={128}
        />
      )}
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
