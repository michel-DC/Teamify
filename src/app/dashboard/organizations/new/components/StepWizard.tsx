"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import FinalStep from "./FinalStep";

export function StepWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profileImage: "",
    organizationType: "",
    mission: "",
    location: null as {
      city: string;
      lat: number;
      lon: number;
      displayName?: string;
    } | null,
    file: undefined as File | undefined,
  });

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);
  const exit = () => router.push("/dashboard/organizations");

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            next={next}
            exit={exit}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <Step2
            next={next}
            prev={prev}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <Step3
            next={next}
            prev={prev}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 4:
        return (
          <Step4
            next={next}
            prev={prev}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 5:
        return (
          <Step5
            next={next}
            prev={prev}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 6:
        return (
          <Step6
            next={next}
            prev={prev}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 7:
        return <FinalStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Indicateur de progression */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5, 6, 7].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 7 && (
                <div
                  className={`w-8 h-1 rounded ${
                    stepNumber < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
