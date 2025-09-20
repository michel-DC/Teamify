"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Wifi, WifiOff } from "lucide-react";

/**
 * Composant de test pour vérifier le système de polling
 */
export const SocketTest = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { isConnected, isConnecting, error, sendMessage, joinConversation } =
    useSocket({
      onMessage: (message) => {
        addTestResult(
          "✅ Message reçu",
          `Message: ${message.content}`,
          "success"
        );
      },
      onError: (error) => {
        addTestResult("❌ Erreur Polling", error.message, "error");
      },
    });

  const addTestResult = (
    title: string,
    description: string,
    type: "success" | "error" | "info"
  ) => {
    setTestResults((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        description,
        type,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    addTestResult(
      "🧪 Début des tests",
      "Initialisation des tests de polling",
      "info"
    );

    // Test 1: Vérifier l'état de connexion
    addTestResult(
      "🔌 État de connexion",
      isConnected
        ? "Connecté"
        : isConnecting
        ? "Connexion en cours..."
        : "Déconnecté",
      isConnected ? "success" : isConnecting ? "info" : "error"
    );

    // Test 2: Vérifier l'URL de polling
    const pollingUrl = "/api/polling";
    addTestResult("🌐 URL Polling", pollingUrl, "info");

    // Test 3: Vérifier l'environnement
    addTestResult(
      "⚙️ Environnement",
      `NODE_ENV: ${process.env.NODE_ENV}, Hostname: ${
        typeof window !== "undefined" ? window.location.hostname : "server"
      }`,
      "info"
    );

    // Test 4: Test de l'endpoint de polling
    if (isConnected) {
      addTestResult(
        "📡 Test de polling",
        "Test de l'endpoint de polling...",
        "info"
      );

      try {
        const response = await fetch("/api/polling?userId=test&timeout=1000");
        if (response.ok) {
          const data = await response.json();
          addTestResult(
            "✅ Polling OK",
            `Réponse: ${JSON.stringify(data)}`,
            "success"
          );
        } else {
          addTestResult(
            "❌ Erreur polling",
            `Status: ${response.status}`,
            "error"
          );
        }
      } catch (error) {
        addTestResult("❌ Erreur polling", `Erreur: ${error}`, "error");
      }
    } else {
      addTestResult(
        "⚠️ Pas de connexion",
        "Impossible de tester le polling",
        "error"
      );
    }

    // Test 5: Test de jointure de conversation
    if (isConnected && joinConversation) {
      addTestResult(
        "🏠 Test de conversation",
        "Test de jointure de conversation...",
        "info"
      );

      try {
        const result = joinConversation("test-conversation");
        addTestResult(
          result ? "✅ Conversation rejointe" : "❌ Échec jointure",
          result
            ? "Conversation de test rejointe"
            : "Impossible de rejoindre la conversation",
          result ? "success" : "error"
        );
      } catch (error) {
        addTestResult("❌ Erreur conversation", `Erreur: ${error}`, "error");
      }
    }

    // Test 6: Test d'envoi de message
    if (isConnected && sendMessage) {
      addTestResult("📨 Test d'envoi", "Test d'envoi de message...", "info");

      try {
        const result = sendMessage({
          conversationId: "test-conversation",
          content: "Message de test",
        });
        addTestResult(
          result ? "✅ Message envoyé" : "❌ Échec envoi",
          result ? "Message de test envoyé" : "Impossible d'envoyer le message",
          result ? "success" : "error"
        );
      } catch (error) {
        addTestResult("❌ Erreur envoi", `Erreur: ${error}`, "error");
      }
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Test Polling
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected
              ? "Connecté"
              : isConnecting
              ? "Connexion..."
              : "Déconnecté"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            {isRunning ? "Tests en cours..." : "Lancer les tests"}
          </Button>

          <Button onClick={clearResults} variant="outline" disabled={isRunning}>
            Effacer
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`p-3 rounded-lg border ${
                  result.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : result.type === "error"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.type === "success" ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  ) : result.type === "error" ? (
                    <XCircle className="h-4 w-4 mt-0.5 text-red-600" />
                  ) : (
                    <Loader2 className="h-4 w-4 mt-0.5 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{result.title}</div>
                    <div className="text-sm opacity-80">
                      {result.description}
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      {result.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Erreur de connexion</span>
            </div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
