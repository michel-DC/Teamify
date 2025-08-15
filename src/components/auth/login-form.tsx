"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  IconBrandGoogle,
  IconBrandApple,
  IconBrandFacebook,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LoadingScreen } from "@/components/ui/Loader";
import { useTheme } from "@/components/theme-provider";

export const LoginForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingOrganization, setCheckingOrganization] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setBlocking(true); // Active un overlay pleine page pour couvrir tout le process

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("isLoggedIn", "true");

        /**
         * Affichage de l'écran de chargement pour la vérification de l'organisation
         */
        setCheckingOrganization(true);
        setLoading(false); // On arrête le loading du bouton pour montrer l'écran de chargement

        // Détermine si l'utilisateur a une organisation
        let hasOrganization = !!data?.hasOrganization;

        if (typeof hasOrganization !== "boolean") {
          // fallback si l'API ne renvoie pas hasOrganization
          try {
            const userResponse = await fetch("/api/user/has-organization", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            const userData = await userResponse.json();
            hasOrganization = !!userData?.hasOrganization;
          } catch {
            hasOrganization = false; // En cas d'erreur, redirige vers création d'organisation
          }
        }

        // Stockage des cookies
        document.cookie = "isLoggedIn=true; path=/";
        document.cookie = `hasOrganization=${hasOrganization}; path=/`;

        /**
         * Petite pause pour que l'utilisateur voie l'écran de chargement
         */
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Toast de succès (sans redirection dans onAutoClose)
        toast.success(
          `Vous êtes maintenant connecté en tant que ${data.user.firstname}!`,
          {
            duration: 2000,
          }
        );

        // Redirection immédiate
        const redirectPath = hasOrganization
          ? "/dashboard"
          : "/create-organization";

        setCheckingOrganization(false);
        setNavigating(true);
        router.replace(redirectPath);
        return; // Ne pas exécuter le finally tout de suite pour garder l'overlay jusqu'à la nav
      } else {
        if (res.status === 500) {
          setError("Erreur serveur (500). Veuillez contacter le support.");
        } else {
          setError(data.error || "Erreur lors de la connexion");
        }
      }
    } catch (err) {
      setError("Erreur réseau");
      console.error("Erreur de connexion:", err);
    } finally {
      setLoading(false);
      setCheckingOrganization(false);
      // Ne pas retirer l'overlay si une navigation est en cours
      if (!navigating) {
        setBlocking(false);
      }
    }
  };

  return (
    <>
      {(checkingOrganization || blocking) && (
        <LoadingScreen
          text={
            checkingOrganization
              ? "Vérification de votre organisation..."
              : "Connexion en cours..."
          }
        />
      )}
      <div className="min-h-screen flex items-center justify-center px-1 xs:px-2 sm:px-3 md:px-4 lg:px-6 bg-background">
        <div
          className={cn(
            "flex flex-col gap-1 xs:gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full max-w-[280px] xs:max-w-[320px] sm:max-w-sm md:max-w-md lg:max-w-lg",
            className
          )}
          {...props}
        >
          <ThemeToggle />

          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6 max-w-sm sm:max-w-md mx-auto w-full border border-border rounded-lg p-4 sm:p-6 bg-card"
          >
            <div className="space-y-3 sm:space-y-4">
              {/* Bouton de retour */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="p-2 h-auto w-auto text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="text-sm">Retour</span>
              </Button>

              <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
                Connexion
              </h2>

              {/* Email */}
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
                  className="h-9 sm:h-10"
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm sm:text-base">
                    Mot de passe
                  </Label>
                  <Link
                    href="/auth/forgot"
                    className="text-xs sm:text-sm underline-offset-4 hover:underline text-muted-foreground hover:text-primary transition-colors"
                    prefetch={false}
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-9 sm:h-10"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-center text-destructive">{error}</p>
            )}

            {/* Bouton de soumission */}
            <div className="flex justify-end pt-3 sm:pt-4">
              <Button
                type="submit"
                className="w-full h-9 sm:h-10 text-sm sm:text-base"
                disabled={loading || blocking}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>

            {/* Séparateur et boutons sociaux */}
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
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" type="button" className="w-full">
                <IconBrandGoogle className="w-4 h-4 mr-2" />
                <span>Google</span>
              </Button>
              <Button variant="outline" type="button" className="w-full">
                <IconBrandApple className="w-4 h-4 mr-2" />
                <span>Apple</span>
              </Button>
              <Button variant="outline" type="button" className="w-full">
                <IconBrandFacebook className="w-4 h-4 mr-2" />
                <span>Facebook</span>
              </Button>
            </div>

            {/* Lien d'inscription */}
            <div className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
              Pas encore de compte ?{" "}
              <Link
                href="/auth/register"
                className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
                prefetch={false}
              >
                Créer un compte
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
