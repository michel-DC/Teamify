"use client";

import React from "react";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function DevelopmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)]"
        )}
      />
      <Spotlight
        className="left-0 -top-40 md:-top-20 md:left-60"
        fill="purple"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto p-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="bg-orange-500/20 text-orange-400 border-orange-500/30"
              >
                🚧 En cours de d&eacute;veloppement
              </Badge>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Projet Teamify
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Plateforme de gestion d&apos;&eacute;v&eacute;nements et
              d&apos;&eacute;quipes en cours de construction
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Section Image */}
            <div className="flex justify-center">
              <div className="max-w-md">
                <Image
                  src="/images/development/worker.svg"
                  alt="D&eacute;veloppement en cours"
                  className="w-full h-auto"
                  width={500}
                  height={500}
                />
              </div>
            </div>

            {/* Section GitHub */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Le projet est open source et disponible sur GitHub
                </p>
                <Button
                  asChild
                  className="bg-violet-600 hover:bg-violet-700 text-white border border-violet-600 shadow-lg"
                >
                  <Link
                    href="https://github.com/michel-dc/Teamify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    Voir le code source
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Merci de votre patience pendant le d&eacute;veloppement ! 🚀
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
