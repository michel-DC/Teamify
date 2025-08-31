"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LoadingScreen } from "@/components/ui/Loader";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";

export const LoginForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { loginWithGoogle, isSyncing } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingOrganization, setCheckingOrganization] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [navigating, setNavigating] = useState(false);
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

  /**
   * Vérification du message de déconnexion au chargement
   */
  useEffect(() => {
    const showLogoutMessage = sessionStorage.getItem("showLogoutMessage");
    if (showLogoutMessage === "true") {
      sessionStorage.removeItem("showLogoutMessage");
      toast.success("Vous avez été déconnecté avec succès ​🥵​", {
        duration: 7000,
      });
    }
  }, []);

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

        // Si il y a un code d'invitation, traiter directement l'invitation
        if (inviteCode) {
          // Stockage des cookies
          document.cookie = "isLoggedIn=true; path=/";
          document.cookie = "hasOrganization=true; path=/"; // Force à true pour éviter la redirection

          /**
           * Petite pause pour que l'utilisateur voie l'écran de chargement
           */
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Toast de succès avec prénom pendant 3s
          toast.success(
            <>
              Vous êtes maintenant connecté en tant que{" "}
              <b>{data.user.firstname}</b> ​❤️‍🔥​
            </>,
            {
              duration: 3000,
            }
          );

          // Redirection vers la page d'invitation
          setCheckingOrganization(false);
          setNavigating(true);
          router.replace(`/invite/${inviteCode}`);
          return;
        }

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

        // Toast de succès avec prénom pendant 3s
        toast.success(
          <>
            Vous êtes maintenant connecté en tant que{" "}
            <b>{data.user.firstname}</b> ​❤️‍🔥​
          </>,
          {
            duration: 3000,
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
                  {isSyncing
                    ? "Connexion en cours..."
                    : "Continuer avec Google"}
                </span>
              </Button>

              {/* Séparateur */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
