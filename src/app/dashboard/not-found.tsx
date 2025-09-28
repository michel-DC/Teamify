"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col gap-6 px-6">
      {/* Header avec breadcrumb */}
      <header className="flex h-16 shrink-0 items-center gap-2 w-full">
        <div className="flex items-center gap-2 px-0">
          <SidebarTrigger>
            <ArrowLeft className="w-4 h-4" />
          </SidebarTrigger>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto">
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

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => router.push("/dashboard")}
                className="items-center gap-2 bg-[#7C3AED] text-white hover:bg-[#7C3AED]/80 border border-[#7C3AED] shadow-lg"
              >
                <Home className="w-5 h-5" />
                Retour au dashboard
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Page précédente
              </Button>
            </div>

            {/* Message d'encouragement */}
            <p className="text-sm text-gray-500 mt-6">
              Ne vous inquiétez pas, même les meilleurs développeurs se perdent
              parfois ! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
