"use client";

import { useDataPersistence } from "@/hooks/useDataPersistence";
import { usePathname } from "next/navigation";

/**
 * @param Gestionnaire de persistance des données
 *
 * Vérifie l'URL actuelle et vide les données de persistance
 * si l'utilisateur n'est pas dans une section dashboard
 */
export function DataPersistenceManager() {
  const pathname = usePathname();

  // TEMPORAIREMENT DÉSACTIVÉ pour diagnostiquer le problème de connexion
  // Ne pas activer sur les pages d'authentification pour éviter les conflits
  const isAuthPage =
    pathname.startsWith("/auth") || pathname.startsWith("/create-organization");

  // Utilisation du hook avec les options par défaut seulement si pas sur une page d'auth
  useDataPersistence({
    requiredPathSegment: "dashboard",
    clearAuthCookies: false,
    debug: process.env.NODE_ENV === "development",
    enabled: false, // TEMPORAIREMENT DÉSACTIVÉ
  });

  // Ce composant ne rend rien visuellement
  return null;
}
