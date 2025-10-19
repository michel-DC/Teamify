"use client";

import { Facebook, Linkedin, Github, Mail, Instagram } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Footer() {
  const handleSupportClick = (service: string) => {
    toast.info(`Service ${service} bientôt disponible !`, {
      description: "Cette fonctionnalité sera ajoutée dans une prochaine mise à jour.",
      duration: 3000,
    });
  };

  return (
    <footer className="bg-[#101010] text-white border-t border-[#2a2a2a] rounded-t-3xl shadow-lg">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-4">
        <div className="text-left sm:text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image src="/images/logo/favicon-text-light.svg" alt="Teamify" width={180} height={180} />
          </div>
          <p className="text-base sm:text-lg text-gray-300 mb-2 text-center">
            Prêt à transformer la gestion de vos événements ?<br />
            Commencez dès maintenant !
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              asChild
              className="px-6 py-3"
            >
              <a href="/dashboard">
                Ça se passe juste ici
              </a>
            </Button>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a] my-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Teamify</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              La plateforme de gestion d'événements qui simplifie l'organisation en équipe. 
              Créez, planifiez et gérez vos événements avec facilité.
            </p>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com/in/micheldjoumessi"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                className="hover:text-[#7C3AED] transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/michel-DC"
                target="_blank"
                rel="noopener"
                aria-label="Github"
                className="hover:text-[#7C3AED] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@onlinemichel.dev"
                target="_blank"
                rel="noopener"
                aria-label="Mail"
                className="hover:text-[#7C3AED] transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Section Produit */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Produit</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="text-gray-400 hover:text-[#635BFF] transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-[#635BFF] transition-colors">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-[#635BFF] transition-colors">
                  Témoignages
                </a>
              </li>
              <li>
                <a href="/demo" className="text-gray-400 hover:text-[#635BFF] transition-colors">
                  Démo
                </a>
              </li>
              <li>
                <a href="/api" className="text-gray-400 hover:text-[#635BFF] transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Section Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => handleSupportClick("Centre d'aide")}
                  className="text-gray-400 hover:text-[#635BFF] transition-colors cursor-pointer"
                >
                  Centre d'aide
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSupportClick("Documentation")}
                  className="text-gray-400 hover:text-[#635BFF] transition-colors cursor-pointer"
                >
                  Documentation
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSupportClick("Tutoriels")}
                  className="text-gray-400 hover:text-[#635BFF] transition-colors cursor-pointer"
                >
                  Tutoriels
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSupportClick("Communauté")}
                  className="text-gray-400 hover:text-[#635BFF] transition-colors cursor-pointer"
                >
                  Communauté
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSupportClick("Statut des services")}
                  className="text-gray-400 hover:text-[#635BFF] transition-colors cursor-pointer"
                >
                  Statut des services
                </button>
              </li>
            </ul>
          </div>

          {/* Section Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/legal-notice" className="text-gray-400 hover:text-[#635BFF] transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-gray-400 hover:text-[#635BFF] transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/cookies-policy" className="text-gray-400 hover:text-[#635BFF] transition-colors">
                  Politique de cookies
                </a>
              </li>
              <li>
                <a href="/cgu" className="text-gray-400 hover:text-[#635BFF] transition-colors">
                  CGU
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a] my-8" />

        <div className="mt-8 text-center text-gray-400 text-xs">
          Design & Dev With <span className="text-red-400">♥</span> by Michel -
         {` ${new Date().getFullYear()} `}
        </div>
      </div>
    </footer>
  );
}