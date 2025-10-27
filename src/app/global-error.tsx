"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "react-day-picker";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
    <Navbar />
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-6">
        {/* Illustration SVG */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-md">
            <Image
              src="/images/illustration/error-page.svg"
              alt="Erreur - Illustration"
              width={400}
              height={300}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-700">
              Oups ! Une erreur s'est produite
            </h2>
            <p className="text-gray-600">
              Désolé, quelque chose s'est mal passé. Veuillez réessayer.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 bg-[#7C3AED] text-white hover:bg-[#7C3AED]/80 border border-[#7C3AED] shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/")}
              variant="outline"
              className="inline-flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Button>
          </div>

          {/* Message d'encouragement */}
          <p className="text-sm text-gray-500 mt-6">
            Cette erreur est plus temporaire qu'un bug qu'on déteste… ❤️
          </p>
        </div>
      </div>
    </div>
    <Footer />
    </>
    );
}
