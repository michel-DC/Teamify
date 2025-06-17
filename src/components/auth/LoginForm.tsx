"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import {
  IconBrandGoogle,
  IconBrandApple,
  IconBrandFacebook,
} from "@tabler/icons-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";

export const LoginForm = () => {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(true);

    try {
      const res = await fetch("../api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Login success:", data);

        localStorage.setItem("isLoggedIn", "true");

        toast.success(
          `Vous êtes maintenant connecté en tant que ${data.user.firstname}!`,
          {
            duration: 2500,
            onAutoClose: async () => {
              const userResponse = await fetch("/api/user/has-organization", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: data.user.email }),
              });

              const userData = await userResponse.json();

              document.cookie = "isLoggedIn=true; path=/";
              document.cookie = `hasOrganization=${userData.hasOrganization}; path=/`;

              if (userData.hasOrganization) {
                router.push("/dashboard");
              } else {
                router.push("/create-organization");
              }
            },
          }
        );

        console.log("Redirection en cours...");
      } else {
        if (res.status === 500) {
          console.log("Erreur 500 détails:", data);
          setError("Erreur serveur (500). Veuillez contacter le support.");
        } else {
          setError(data.error || "Erreur lors de la connexion");
          console.error("Login error:", data);
        }
      }
    } catch (err) {
      setError("Erreur réseau");
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-card hover:bg-accent transition-colors duration-200 shadow-lg"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-foreground" />
        ) : (
          <Sun className="w-5 h-5 text-foreground" />
        )}
      </Button>

      <Toaster position="top-center" richColors />
      <Card className="w-full max-w-4xl shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Link
                href="/"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-center">Vous revoilà</h1>
                <p className="text-muted-foreground text-center">
                  Connectez-vous pour accéder à votre espace et créer votre
                  évènement
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link
                      href="/auth/forgot"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
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
                    className="w-full"
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-center text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
              <div className="relative">
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
              <div className="text-center text-sm">
                Pas encore de compte ?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium underline underline-offset-4 hover:text-primary"
                  prefetch={false}
                >
                  Créer en un
                </Link>
              </div>
            </div>
          </form>
          <div className="hidden md:block relative bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="absolute inset-0 bg-background/50" />
            <Image
              alt="login-page-image-illus"
              src="/images/svg/auth.svg"
              width={600}
              height={600}
              className="absolute inset-0 h-full w-full object-contain"
              priority
            />
          </div>
        </CardContent>
      </Card>
      <div className="fixed bottom-4 text-muted-foreground text-center text-xs">
        En cliquant sur continuer, vous acceptez nos{" "}
        <a href="#" className="underline hover:text-primary">
          Conditions d'utilisation
        </a>{" "}
        et <a href="#">Politique de confidentialité</a>.
      </div>
    </div>
  );
};
