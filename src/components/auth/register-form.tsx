"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { ThemeToggle } from "../ui/theme-toggle";

export const RegisterForm = () => {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("../api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          passwordHash: password,
        }),
      });

      const text = await res.text();

      if (res.ok) {
        toast.success(`Bienvenue sur teamify ${lastname} !`, {
          duration: 4000,
          onAutoClose: () => {
            router.push("/auth/login");
          },
        });
      } else {
        try {
          setError(JSON.parse(text).error || "Une erreur est survenue");
          console.error("Registration error:", JSON.parse(text));
        } catch {
          setError("Erreur serveur: réponse non valide");
          console.error("Failed to parse error response:", text);
        }
      }
    } catch {
      setError("Erreur réseau");
      console.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-1 xs:px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 bg-background">
      <div className="flex flex-col gap-1 xs:gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full max-w-[320px] xs:max-w-[480px] sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl">
        <ThemeToggle />

        <Toaster position="top-center" richColors />

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 max-w-lg sm:max-w-xl mx-auto w-full border border-border rounded-lg p-4 sm:p-6 bg-card"
        >
          <div className="space-y-3 sm:space-y-4">
            {/* Bouton de retour */}
            <Link
              href="/"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors p-2 h-auto w-auto"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
              <span className="text-sm">Retour à l&apos;accueil</span>
            </Link>

            {/* Titre avec sous-titre */}
            <div className="text-center space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold">Bienvenue</h1>
              <p className="text-sm text-muted-foreground">
                Inscrivez-vous pour accéder à votre espace et créer votre
                évènement
              </p>
            </div>

            {/* Champs Prénom et Nom côte à côte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-sm sm:text-base">
                  Prénom
                </Label>
                <Input
                  id="firstname"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="Tyler"
                  type="text"
                  required
                  autoComplete="given-name"
                  className="h-9 sm:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="text-sm sm:text-base">
                  Nom
                </Label>
                <Input
                  id="lastname"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Durden"
                  type="text"
                  autoComplete="family-name"
                  className="h-9 sm:h-10"
                />
              </div>
            </div>

            {/* Champ Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">
                Adresse mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@gmail.com"
                required
                autoComplete="email"
                className="h-9 sm:h-10"
              />
            </div>

            {/* Champs Mot de passe et Confirmation côte à côte sur md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="h-9 sm:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmpassword"
                  className="text-sm sm:text-base"
                >
                  Confirmez votre mot de passe
                </Label>
                <Input
                  id="confirmpassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="h-9 sm:h-10"
                />
              </div>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <p className="text-xs sm:text-sm text-center text-destructive">
              {error}
            </p>
          )}

          {/* Bouton de soumission */}
          <div className="flex justify-end pt-3 sm:pt-4">
            <Button
              type="submit"
              className="w-full h-9 sm:h-10 text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? "Création en cours..." : "S'inscrire"}
            </Button>
          </div>

          {/* Lien de connexion */}
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link
              href="/auth/login"
              className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
              prefetch={false}
            >
              Connectez-vous
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
