"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Zap,
  CheckCircle,
  Clock,
  Target,
  Mail,
  UserPlus,
  Settings
} from "lucide-react";
import { FeatureDetailModal } from "./feature-detail-modal";

const features = [
  {
    emoji: "📅",
    title: "Création d'Événements",
    description: "Créez, planifiez et gérez vos événements avec des outils puissants. Suivi en temps réel, invitations automatiques et gestion des participants.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
    features: ["Planification avancée", "Invitations automatiques", "Suivi en temps réel"]
  },
  {
    emoji: "👥",
    title: "Création d'Organisations",
    description: "Créez vos organisations avec des rôles personnalisés. Gérez les permissions, invitez des membres et structurez vos projets.",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
    features: ["Rôles personnalisés", "Gestion des permissions", "Invitations d'équipe"]
  },
  {
    emoji: "💬",
    title: "Messagerie Temps Réel",
    description: "Communiquez instantanément avec votre équipe. Conversations privées et de groupe avec notifications en temps réel.",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
    features: ["Messages instantanés", "Conversations de groupe", "Notifications temps réel"]
  },
  {
    emoji: "🔔",
    title: "Système de Notifications",
    description: "Restez informé en temps réel. Notifications push, emails automatiques et alertes personnalisées pour tous vos événements.",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    dotColor: "bg-orange-500",
    features: ["Notifications push", "Emails automatiques", "Alertes personnalisées"]
  },
  {
    emoji: "🔍",
    title: "Recherche Intelligente",
    description: "Trouvez instantanément ce que vous cherchez. Recherche globale, filtrage avancé et suggestions intelligentes.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dotColor: "bg-indigo-500",
    features: ["Recherche globale", "Filtrage avancé", "Suggestions intelligentes"]
  },
  {
    emoji: "📊",
    title: "Analytics & Tableau de Bord",
    description: "Analysez vos performances avec des métriques détaillées. Tableaux de bord personnalisables et rapports en temps réel.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dotColor: "bg-emerald-500",
    features: ["Métriques détaillées", "Tableaux de bord", "Rapports temps réel"]
  }
];

export function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  function handleFeatureClick(featureTitle: string) {
    setSelectedFeature(featureTitle);
  }

  function handleCloseModal() {
    setSelectedFeature(null);
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge
            variant="secondary"
            className="bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20 px-4 py-2 text-sm font-medium rounded-3xl mb-6"
          >
            <div className="w-2 h-2 bg-[#7C3AED] rounded-full mr-2"></div>
            Fonctionnalités
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#262626] mb-6">
            Tout ce dont vous avez besoin pour
            <br />
            <span className="text-[#7C3AED]">organiser efficacement</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-[#262626]/70 max-w-3xl mx-auto leading-relaxed">
            Une plateforme complète qui regroupe tous les outils nécessaires pour gérer vos événements, 
            collaborer avec vos équipes et communiquer en temps réel.
          </p>
        </motion.div>

        {/* Features Cards Layout */}
        <div className="relative">
          {/* Ligne de connexion horizontale - cachée sur mobile */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent"></div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative h-full"
              >
                {/* Feature Card */}
                <div className={`relative ${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col`}
                     onClick={() => handleFeatureClick(feature.title)}>
                  
                  {/* Badge */}
                  <Badge
                    variant="secondary"
                    className={`${feature.badgeColor} px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-2 mb-4`}
                  >
                    <div className={`w-1.5 h-1.5 ${feature.dotColor} rounded-full`}></div>
                    Fonctionnalité
                  </Badge>

                  {/* Icon */}
                  <div className="mb-4">
                    <div className={`w-12 h-12 ${feature.bgColor} ${feature.borderColor} border rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{feature.emoji}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#262626] mb-3 leading-tight">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm sm:text-base text-[#262626]/70 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6 flex-grow">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 ${feature.dotColor} rounded-full flex-shrink-0`}></div>
                        <span className="text-xs sm:text-sm font-medium text-[#262626]/80">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1">
                      {features.map((_, dotIndex) => (
                        <div 
                          key={dotIndex}
                          className={`w-2 h-2 rounded-full ${
                            dotIndex <= index ? feature.dotColor : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#262626]/50 font-medium">
                      {index + 1}/{features.length}
                    </span>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

              </motion.div>
            ))}
          </div>
        </div>

        {/* Éléments décoratifs de fond */}
        <div className="hidden sm:block absolute top-20 left-0 w-32 h-32 bg-[#7C3AED]/5 rounded-full blur-3xl"></div>
        <div className="hidden sm:block absolute bottom-20 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Modal pour les détails des fonctionnalités */}
      {selectedFeature && (
        <FeatureDetailModal
          isOpen={!!selectedFeature}
          onClose={handleCloseModal}
          featureTitle={selectedFeature}
        />
      )}
    </section>
  );
}