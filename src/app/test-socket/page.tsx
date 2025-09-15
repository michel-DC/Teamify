"use client";

import { SocketTest } from "@/components/test/socket-test";
import { SocketSimpleTest } from "@/components/test/socket-simple-test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Page de test pour Socket.IO Vercel
 */
export default function TestSocketPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Test Socket.IO Vercel</h1>
        </div>
        <p className="text-muted-foreground">
          Cette page permet de tester la connexion Socket.IO compatible Vercel.
          Utilisez les contrôles ci-dessous pour vérifier que tout fonctionne
          correctement.
        </p>
      </div>

      <div className="space-y-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions de test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>
                <strong>Test de connexion :</strong> Vérifiez que le statut
                passe à "Connecté"
              </li>
              <li>
                <strong>Test API :</strong> Cliquez sur "Test Connexion" et
                "Test Ping" pour vérifier les endpoints
              </li>
              <li>
                <strong>Test d'envoi :</strong> Tapez un message et cliquez sur
                "Envoyer"
              </li>
              <li>
                <strong>Test de réception :</strong> Le message devrait
                apparaître dans la liste des messages reçus
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Composant de test simplifié - Fonctionne avec Vercel */}
        <SocketSimpleTest />

        {/* Note sur Socket.IO natif */}
        <Card>
          <CardHeader>
            <CardTitle>Note sur Socket.IO natif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              L'implémentation Socket.IO native avec Vercel pose des problèmes
              de protocole. L'approche simplifiée ci-dessus utilise des requêtes
              HTTP standard qui fonctionnent parfaitement avec Vercel.
            </p>
            <p>
              <strong>Recommandation :</strong> Utilisez l'approche simplifiée
              pour la production.
            </p>
          </CardContent>
        </Card>

        {/* Informations techniques */}
        <Card>
          <CardHeader>
            <CardTitle>Informations techniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Transport :</strong> Polling uniquement (compatible
              Vercel)
            </div>
            <div>
              <strong>API Route :</strong> <code>/api/socket-io</code>
            </div>
            <div>
              <strong>Test API :</strong> <code>/api/test-socket</code>
            </div>
            <div>
              <strong>Configuration :</strong> Vercel rewrites activés
            </div>
            <div>
              <strong>Limitations :</strong> Pas de WebSockets, connexion non
              persistante
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
