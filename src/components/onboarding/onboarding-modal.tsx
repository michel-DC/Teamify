"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { setCookie } from "@/lib/cookie-utils";

// Types pour les étapes d'onboarding
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

// Définition des étapes d'onboarding
const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bienvenue sur Teamify !",
    description:
      "Découvrez comment organiser et gérer vos événements de manière efficace avec votre équipe.",
    emoji: "🎉",
  },
  {
    id: "organizations",
    title: "Gérez vos organisations",
    description:
      "Créez et gérez plusieurs organisations, invitez des membres et définissez leurs rôles.",
    emoji: "🏢",
  },
  {
    id: "events",
    title: "Organisez vos événements",
    description:
      "Créez des événements, gérez les invitations et suivez les participations en temps réel.",
    emoji: "📅",
  },
  {
    id: "messaging",
    title: "Communiquez avec votre équipe",
    description:
      "Utilisez la messagerie intégrée pour échanger avec vos collègues et collaborateurs.",
    emoji: "💬",
  },
  {
    id: "notifications",
    title: "Restez informé",
    description:
      "Recevez des notifications en temps réel pour les événements, messages et invitations.",
    emoji: "🔔",
  },
  {
    id: "analytics",
    title: "Analysez vos performances",
    description:
      "Consultez les statistiques et métriques pour optimiser vos événements et équipes.",
    emoji: "📊",
  },
  {
    id: "collaboration",
    title: "Collaborez efficacement",
    description:
      "Partagez des fichiers, assignez des tâches et travaillez ensemble sur vos projets.",
    emoji: "🤝",
  },
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleFinish = () => {
    // Marquer l'onboarding comme vu dans les cookies
    setCookie("hasSeenTheOnboardingPresentation", "true", 365); // 1 an
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Découvrez Teamify
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Prenez quelques minutes pour découvrir les fonctionnalités
            principales
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step content */}
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">{currentStepData.emoji}</div>

            <div
              className={`transition-all duration-300 ${
                isAnimating
                  ? "opacity-0 transform translate-x-4"
                  : "opacity-100 transform translate-x-0"
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-white hover:text-white bg-[#7C3AED] hover:bg-[#6D28D9]"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 text-white hover:text-white bg-[#7C3AED] hover:bg-[#6D28D9]"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                "Terminer l'onboarding"
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
