"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  const router = useRouter();

  return (
    <>
    <Navbar />
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-6">
        {/* Illustration SVG */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-md">
            <Image
              src="/images/illustration/not-found-page.svg"
              alt="Page non trouvée - Illustration"
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
              Oups ! Cette page a disparu
            </h2>
          </div>

          {/* Bouton de retour */}
          <div className="pt-4">
            <Button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 bg-[#7C3AED] text-white hover:bg-[#7C3AED]/80 border border-[#7C3AED] shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la page d'accueil
            </Button>
          </div>

          {/* Message d'encouragement */}
          <p className="text-sm text-gray-500 mt-6">
            Cette page est plus introuvable qu’un bug qu’on aime bien… ❤️
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
