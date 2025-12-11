"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SideCursors from "@/components/pages/landing/cursor";
import { Calendar, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { loginWithGoogle, isSyncing } = useAuth();

  function handleGoogleLogin() {
    loginWithGoogle();
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center w-full pt-16">
      <SideCursors />
      <div className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200 px-3 py-2 text-xs sm:text-sm font-medium rounded-3xl"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="hidden sm:inline">
                Plateforme de gestion d'événements nouvelle génération
              </span>
              <span className="sm:hidden">
                Plateforme de gestion d'événements
              </span>
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 sm:mb-8"
          >
            <span className="text-[#262626]">Organisez tout.</span>
            <br />
            <div className="inline-flex items-center gap-2 sm:gap-4 bg-gray-100 border border-gray-300 rounded-lg px-4 py-4 sm:px-8 sm:py-6 mt-2 sm:mt-4">
              <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-[#7C3AED]" />
              <span className="text-[#7C3AED] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                Collaborez mieux.
              </span>
            </div>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-[#262626]/80 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2"
          >
            La plateforme tout-en-un pour organiser vos événements, collaborer
            avec vos équipes et communiquer en temps réel. Simplifiez votre
            gestion d'événements avec des outils puissants et intuitifs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 w-full max-w-md sm:max-w-none mx-auto"
          >
            <Button
              onClick={handleGoogleLogin}
              disabled={isSyncing}
              className="bg-[#7C3AED] text-white px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg font-semibold flex items-center justify-center gap-3 h-12 sm:h-14 rounded-full w-full sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                  {/* Blue part */}
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  {/* Green part */}
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  {/* Yellow part */}
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  {/* Red part */}
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isSyncing ? "Connexion..." : "Continuer avec Google"}
                </span>
                <span className="sm:hidden">
                  {isSyncing ? "Connexion..." : "Continuer avec Google"}
                </span>
              </span>
            </Button>

            <Button
              variant="outline"
              className="border-[#262626]/30 text-[#262626] hover:bg-gray-300 px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg font-semibold h-12 sm:h-14 rounded-full cursor-pointer w-full sm:w-auto"
            >
              <Link href="/auth/register">
                <span className="hidden sm:inline">Essayer Gratuitement</span>
                <span className="sm:hidden">Essayer Gratuitement</span>
              </Link>
            </Button>
          </motion.div>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hidden sm:flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2"
          >
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-2 text-xs sm:text-sm font-medium rounded-3xl"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="hidden sm:inline">
                Application 100% gratuite
              </span>
              <span className="sm:hidden">Gratuit</span>
            </Badge>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-2 text-xs sm:text-sm font-medium rounded-3xl"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2"></div>
              <span className="hidden sm:inline">Messagerie temps réel</span>
              <span className="sm:hidden">Temps réel</span>
            </Badge>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200 px-3 py-2 text-xs sm:text-sm font-medium rounded-3xl"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="hidden sm:inline">Gestion d'équipes</span>
              <span className="sm:hidden">Équipes</span>
            </Badge>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
