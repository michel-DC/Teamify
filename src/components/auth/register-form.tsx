"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Sun, Moon } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

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
        body: JSON.stringify({ firstname, lastname, email, password }),
      });

      const text = await res.text();
      console.log("Raw response:", text);

      if (res.ok) {
        const data = JSON.parse(text);
        toast.success(`Bienvenue sur teamify ${lastname} !`, {
          duration: 4000,
          onAutoClose: () => {
            router.push("/auth/login");
          },
        });
      } else {
        try {
          const data = JSON.parse(text);
          setError(data.error || "Une erreur est survenue");
          console.error("Registration error:", data);
        } catch (err) {
          setError("Erreur serveur: réponse non valide");
          console.error("Failed to parse error response:", text);
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
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-card hover:bg-accent transition-colors duration-200 shadow-lg"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-foreground" />
        ) : (
          <Sun className="w-5 h-5 text-foreground" />
        )}
      </button>

      <Toaster position="top-center" richColors />
      <Card className="w-full max-w-4xl shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="hidden md:block relative bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="absolute inset-0 bg-background/50" />
            <Image
              alt="register-page-image-illus"
              src="/images/svg/auth.svg"
              width={400}
              height={400}
              className="absolute inset-0 h-full w-full object-contain"
              priority
            />
          </div>
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
                <h1 className="text-3xl font-bold text-center">Bienvenue</h1>
                <p className="text-muted-foreground text-center">
                  Inscrivez-vous pour accéder à votre espace et créer votre
                  évènement
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Prénom</Label>
                    <Input
                      id="firstname"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      placeholder="Tyler"
                      type="text"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Nom</Label>
                    <Input
                      id="lastname"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      placeholder="Durden"
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmpassword">
                    Confirmez votre mot de passe
                  </Label>
                  <Input
                    id="confirmpassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-center text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création en cours..." : "S'inscrire"}
              </Button>
              <div className="text-center text-sm">
                Déjà un compte ?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium underline underline-offset-4 hover:text-primary"
                  prefetch={false}
                >
                  Connectez-vous
                </Link>
              </div>
            </div>
          </form>
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
