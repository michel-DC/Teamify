"use client";

import React, { useState, useEffect } from "react";
import Welcome from "./welcome";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import FinalStep from "./FinalStep";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StepWizard() {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDarkMode ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profileImage: "",
    memberCount: 0,
    size: "",
    mission: "",
  });

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Welcome next={next} formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step1 next={next} formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step2 next={next} prev={prev} formData={formData} setFormData={setFormData} />;
      case 4:
        return <Step3 next={next} prev={prev} formData={formData} setFormData={setFormData} />;
      case 5:
        return <Step4 next={next} prev={prev} formData={formData} setFormData={setFormData} />;
      case 6:
        return <Step5 next={next} prev={prev} formData={formData} setFormData={setFormData} />;
      case 7:
        return <Step6 next={next} prev={prev} formData={formData} setFormData={setFormData} />;
      case 8:
        return <FinalStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-card hover:bg-accent transition-colors duration-200"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-foreground" />
        ) : (
          <Sun className="w-5 h-5 text-foreground" />
        )}
      </button>

      <div className="max-w-2xl w-full p-6 bg-card rounded-lg border border-border shadow-sm space-y-6 overflow-hidden">
        <div className="text-muted-foreground text-sm">Étape {step} sur 8</div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
