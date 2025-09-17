"use client";

import { StepProps } from "@/types/steps";
import { Button } from "@/components/ui/button";

export default function Step1({
  next,
  exit,
  formData,
  setFormData,
}: StepProps) {
  const handleNext = () => {
    if (next) next();
  };

  const handleExit = () => {
    if (exit) exit();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Quel est le nom de votre organisation ?
      </h2>
      <input
        type="text"
        className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ex: Les Étoiles Solidaires"
      />
      <Button
        onClick={handleNext}
        disabled={!formData.name}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
      >
        Suivant
      </Button>
      <Button
        onClick={handleExit}
        className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/90 transition-all duration-200"
      >
        Annuler
      </Button>
    </div>
  );
}
