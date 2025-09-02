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
import { useAuth } from "@/hooks/useAuth";

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
  const { loginWithGoogle, isSyncing } = useAuth();
  const [blocking, setBlocking] = useState(false);
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
    setBlocking(true);
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
      setBlocking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-1 xs:px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 bg-background">
      <div className="flex flex-col gap-1 xs:gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full max-w-[320px] xs:max-w-[480px] sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl">
        <ThemeToggle />

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
          {/* Bouton de connexion Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 flex items-center justify-center gap-3 border-border hover:bg-muted/50 transition-colors"
            onClick={() => loginWithGoogle(inviteCode || undefined)}
            disabled={isSyncing || loading || blocking}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium">
              {isSyncing ? "Connexion en cours..." : "Continuer avec Google"}
            </span>
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
