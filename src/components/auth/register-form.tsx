"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "../ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Eye, EyeOff } from "lucide-react";
import { IconBrandGoogle } from "@tabler/icons-react";
import { ThemeToggle } from "../ui/theme-toggle";
import { useTheme } from "@/components/theme-provider";

export const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  /**
   * Récupération du code d'invitation depuis l'URL au chargement
   */
  useEffect(() => {
    const invite = searchParams.get("invite");
    if (invite) {
      setInviteCode(invite);
    }
  }, [searchParams]);

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
          inviteCode, // Ajout du code d'invitation si présent
        }),
      });

      const text = await res.text();

      if (res.ok) {
        const responseData = JSON.parse(text);
        toast.success(`Bienvenue sur teamify ${lastname} ​👑​`, {
          duration: 4000,
          onAutoClose: () => {
            // Si il y a un code d'invitation et que l'utilisateur a une organisation, aller au dashboard
            if (inviteCode && responseData.hasOrganization) {
              router.push("/dashboard");
            } else if (inviteCode) {
              // Si il y a un code d'invitation mais pas d'organisation, traiter l'invitation
              router.push(`/invite/${inviteCode}`);
            } else {
              router.push("/auth/login");
            }
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
                {inviteCode
                  ? "Inscrivez-vous pour rejoindre l'organisation"
                  : "Inscrivez-vous pour accéder à votre espace et créer votre évènement"}
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="h-9 sm:h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmpassword"
                  className="text-sm sm:text-base"
                >
                  Confirmez votre mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmpassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="h-9 sm:h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
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

          {/* Séparateur et bouton Google */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continuez avec
              </span>
            </div>
          </div>
          <Button variant="outline" type="button" className="w-full">
            <IconBrandGoogle className="w-4 h-4 mr-2" />
            <span>Google</span>
          </Button>

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
