"use client";

import { useState } from "react";
import {
  EventCreationStep,
  EVENT_CREATION_STEPS,
  EventFormData,
} from "../../../../../types/steps-event-creation";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { Step4 } from "./Step4";
import { SummaryStep } from "./SummaryStep";

interface StepWizardProps {
  orgId: string;
  onComplete: (data: EventFormData) => void;
  onCancel: () => void;
  eventCode?: string;
}

export function StepWizard({
  orgId,
  onComplete,
  onCancel,
  eventCode,
}: StepWizardProps) {
  const [currentStep, setCurrentStep] =
    useState<EventCreationStep>("basic-info");
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    category: "REUNION",
    startDate: "",
    endDate: "",
    location: "",
    capacity: "",
    budget: "",
    status: "A_VENIR",
    isPublic: true,
    orgId: orgId,
  });

  /**
   * Met à jour les données du formulaire pour l'étape courante
   */
  const updateFormData = (stepData: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  /**
   * Vérifie si l'étape courante est complète
   */
  const isStepComplete = (step: EventCreationStep): boolean => {
    switch (step) {
      case "basic-info":
        return !!(formData.title && formData.description && formData.category);
      case "dates-location":
        // Validation simple : vérifier que les champs requis sont remplis
        // La validation détaillée des contraintes de temps est gérée dans Step2
        return !!(formData.startDate && formData.endDate && formData.location);
      case "capacity-budget":
        // Le statut est maintenant calculé automatiquement, on ne vérifie que la capacité et le budget
        return !!(formData.capacity && formData.budget);
      case "configuration":
        return true; // Toujours complète car valeurs par défaut
      case "summary":
        return true; // Toujours complète car c'est la dernière étape
      default:
        return false;
    }
  };

  /**
   * Passe à l'étape suivante
   */
  const nextStep = () => {
    const currentIndex = EVENT_CREATION_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    if (currentIndex < EVENT_CREATION_STEPS.length - 1) {
      const nextStepId = EVENT_CREATION_STEPS[currentIndex + 1].id;
      setCurrentStep(nextStepId);
    }
  };

  /**
   * Retourne à l'étape précédente
   */
  const prevStep = () => {
    const currentIndex = EVENT_CREATION_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    if (currentIndex > 0) {
      const prevStepId = EVENT_CREATION_STEPS[currentIndex - 1].id;
      setCurrentStep(prevStepId);
    }
  };

  /**
   * Rendu de l'étape courante
   */
  const renderCurrentStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      onNext: nextStep,
      onPrev: prevStep,
      isStepComplete: isStepComplete(currentStep),
    };

    switch (currentStep) {
      case "basic-info":
        return <Step1 {...commonProps} eventCode={eventCode} />;
      case "dates-location":
        return <Step2 {...commonProps} />;
      case "capacity-budget":
        return <Step3 {...commonProps} />;
      case "configuration":
        return <Step4 {...commonProps} />;
      case "summary":
        return (
          <SummaryStep
            {...commonProps}
            onComplete={onComplete}
            onCancel={onCancel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Indicateur de progression */}
      <div className="mb-8">
        {/* Version desktop - affichage horizontal complet */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            {EVENT_CREATION_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep === step.id
                      ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                      : index <
                        EVENT_CREATION_STEPS.findIndex(
                          (s) => s.id === currentStep
                        )
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  {index <
                  EVENT_CREATION_STEPS.findIndex((s) => s.id === currentStep)
                    ? "✓"
                    : index + 1}
                </div>
                {index < EVENT_CREATION_STEPS.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      index <
                      EVENT_CREATION_STEPS.findIndex(
                        (s) => s.id === currentStep
                      )
                        ? "bg-green-500"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {EVENT_CREATION_STEPS.map((step) => (
              <div
                key={step.id}
                className={`text-xs text-center ${
                  currentStep === step.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Version mobile - affichage compact avec indicateur de progression */}
        <div className="md:hidden">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {EVENT_CREATION_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm ${
                    currentStep === step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : index <
                        EVENT_CREATION_STEPS.findIndex(
                          (s) => s.id === currentStep
                        )
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  {index <
                  EVENT_CREATION_STEPS.findIndex((s) => s.id === currentStep)
                    ? "✓"
                    : index + 1}
                </div>
                {index < EVENT_CREATION_STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      index <
                      EVENT_CREATION_STEPS.findIndex(
                        (s) => s.id === currentStep
                      )
                        ? "bg-green-500"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Titre de l'étape courante sur mobile */}
          <div className="text-center">
            <div className="text-sm font-medium text-primary">
              {
                EVENT_CREATION_STEPS.find((step) => step.id === currentStep)
                  ?.title
              }
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Étape{" "}
              {EVENT_CREATION_STEPS.findIndex(
                (step) => step.id === currentStep
              ) + 1}{" "}
              sur {EVENT_CREATION_STEPS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de l'étape courante */}
      {renderCurrentStep()}
    </div>
  );
}
