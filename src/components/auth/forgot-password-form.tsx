"use client";
import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Label } from "../ui/label";
import { Input } from "../ui/Input";
import { cn } from "@/lib/utils";
import {
  IconBrandGoogle,
  IconBrandApple,
  IconBrandFacebook,
} from "@tabler/icons-react";
import { Moon, Sun } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/components/theme-provider";

export const ForgotPassword = () => {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(
          `Un email de réinitialisation a été envoyé à ${data.user.firstname}.`
        );
      } else {
        toast.error("Cette adresse email n'est pas enregistrée.");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4 sm:px-6">
      <Toaster position="top-center" richColors />
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
      <div className="p-6 sm:p-8 mx-auto w-full max-w-md bg-card rounded-lg border border-border shadow-sm">
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 mb-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
          Retour à l&apos;accueil
        </Link>
        <h2 className="text-lg sm:text-xl font-medium text-foreground">
          Réinitialiser votre mot de passe
        </h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
        </p>
        <form className="mt-6 sm:mt-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Adresse mail</Label>
            <Input
              id="email"
              placeholder="email@gmail.com"
              type="email"
              className="bg-secondary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </LabelInputContainer>

          <button
            className="w-full p-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Vérification en cours..."
              : "Reinitialiser mon mot de passe →"}
          </button>
          <Link
            href="/auth/login"
            className="flex justify-center items-center pt-4 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
            prefetch={false}
          >
            Vous possédez déjà un compte ? Se connecter
          </Link>

          <div className="my-6 sm:my-8 h-[1px] w-full bg-border" />

          <div className="flex flex-col space-y-3 sm:space-y-4">
            <button
              className="w-full p-2 sm:p-2.5 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-accent transition-all duration-200 flex items-center justify-center gap-2"
              type="button"
            >
              <IconBrandGoogle className="w-4 h-4" />
              <span>Google</span>
            </button>
            <button
              className="w-full p-2 sm:p-2.5 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-accent transition-all duration-200 flex items-center justify-center gap-2"
              type="button"
            >
              <IconBrandApple className="w-4 h-4" />
              <span>Apple</span>
            </button>
            <button
              className="w-full p-2 sm:p-2.5 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-accent transition-all duration-200 flex items-center justify-center gap-2"
              type="button"
            >
              <IconBrandFacebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LabelInputContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
