"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <DialogTitle className="text-lg font-semibold text-center">
                Découvrez Teamify
              </DialogTitle>
            </motion.div>
            <motion.p
              className="text-sm text-muted-foreground text-center"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Prenez quelques minutes pour découvrir les fonctionnalités
              principales
            </motion.p>
          </DialogHeader>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Step content */}
            <div className="text-center space-y-4">
              <motion.div
                className="text-6xl mb-4"
                key={`emoji-${currentStep}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {currentStepData.emoji}
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {currentStepData.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentStepData.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <motion.div
              className="flex justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 text-white hover:text-white bg-[#7C3AED] hover:bg-[#6D28D9]"
                >
                  <motion.div
                    animate={{ x: currentStep > 0 ? 0 : -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </motion.div>
                  Précédent
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 text-white hover:text-white bg-[#7C3AED] hover:bg-[#6D28D9]"
                >
                  {currentStep === onboardingSteps.length - 1 ? (
                    "Terminer l'onboarding"
                  ) : (
                    <>
                      Suivant
                      <motion.div
                        animate={{ x: 0 }}
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
