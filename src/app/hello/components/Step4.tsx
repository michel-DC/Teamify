"use client";

import { StepProps } from "../../../../types/steps";

export default function Step4({ next, formData, setFormData }: StepProps) {
  const handleNext = () => {
    if (next) next();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Combien de membres compte votre organisation ?
      </h2>
      <input
        type="number"
        min={1}
        className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
        value={formData.memberCount || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            memberCount: parseInt(e.target.value || "0"),
          })
        }
      />
      <div className="flex justify-between gap-4">
        <button
          onClick={handleNext}
          disabled={!formData.name}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Précedent
        </button>
        <button
          onClick={next}
          disabled={!formData.memberCount}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
