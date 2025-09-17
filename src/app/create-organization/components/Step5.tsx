"use client";

import { StepProps } from "@/types/steps";
import { Button } from "react-day-picker";

export default function Step5({
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
        Quel est le type de votre organisation ?
      </h2>
      <select
        className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
        value={formData.organizationType}
        onChange={(e) =>
          setFormData({ ...formData, organizationType: e.target.value })
        }
      >
        <option value="" className="text-muted-foreground">
          Choisir
        </option>
        <option value="ASSOCIATION" className="text-foreground">
          Association
        </option>
        <option value="PME" className="text-foreground">
          PME
        </option>
        <option value="ENTREPRISE" className="text-foreground">
          Entreprise
        </option>
        <option value="STARTUP" className="text-foreground">
          Startup
        </option>
        <option value="AUTO_ENTREPRENEUR" className="text-foreground">
          Auto-entrepreneur
        </option>
      </select>
      <div className="flex justify-between gap-4">
        <Button
          onClick={handlePrev}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Précedent
        </Button>
        <Button
          onClick={handleNext}
          disabled={!formData.organizationType}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
