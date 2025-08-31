"use client";

import { Suspense } from "react";
import { GoogleCallbackContent } from "./google-callback-content";

/**
 * Page de callback pour l'authentification Google
 * Enveloppe le contenu dans une boundary Suspense pour useSearchParams
 */
export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<GoogleCallbackFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}

/**
 * Composant de fallback affiché pendant le chargement
 */
function GoogleCallbackFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">
            Préparation de l'authentification
          </p>
        </div>
      </div>
    </div>
  );
}
