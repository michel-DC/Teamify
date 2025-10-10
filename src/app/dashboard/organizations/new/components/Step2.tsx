"use client";

import { StepProps } from "@/types/steps";
import { Button } from "@/components/ui/button";

export default function Step2({
  next,
  prev,
  formData,
  setFormData,
}: StepProps) {
  const handleNext = () => {
    if (next) next();
  };

  const handlePrev = () => {
    if (prev) prev();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Décrivez brièvement votre organisation
      </h2>
      <textarea
        className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Ex: Nous aidons les jeunes à découvrir le code."
        rows={4}
      />
      <div className="flex justify-between gap-4">
        <Button
          onClick={handlePrev}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Précédent
        </Button>
        <Button
          onClick={handleNext}
          disabled={!formData.bio}
          className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white border border-violet-600 shadow-lg rounded-md transition-all duration-200"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
