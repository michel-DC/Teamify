"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Bell, 
  Search, 
  BarChart3, 
  Shield, 
  Zap,
  CheckCircle,
  Clock,
  Target,
  Mail,
  UserPlus,
  Settings
} from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: Calendar,
    title: "Création d'Événements",
    description: "Créez, planifiez et gérez vos événements avec des outils puissants. Suivi en temps réel, invitations automatiques et gestion des participants.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
    image: "/images/demo/create-event.png",
    features: ["Planification avancée", "Invitations automatiques", "Suivi en temps réel"]
  },
  {
    icon: Users,
    title: "Création d'Organisations",
    description: "Créez vos organisations avec des rôles personnalisés. Gérez les permissions, invitez des membres et structurez vos projets.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
    image: "/images/demo/create-organization.png",
    features: ["Rôles personnalisés", "Gestion des permissions", "Invitations d'équipe"]
  },
  {
    icon: MessageSquare,
    title: "Messagerie Temps Réel",
    description: "Communiquez instantanément avec votre équipe. Conversations privées et de groupe avec notifications en temps réel.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
    image: "/images/demo/messaging.png",
    features: ["Messages instantanés", "Conversations de groupe", "Notifications temps réel"]
  },
  {
    icon: Bell,
    title: "Système de Notifications",
    description: "Restez informé en temps réel. Notifications push, emails automatiques et alertes personnalisées pour tous vos événements.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    dotColor: "bg-orange-500",
    image: "/images/demo/notifications.png",
    features: ["Notifications push", "Emails automatiques", "Alertes personnalisées"]
  },
  {
    icon: Search,
    title: "Recherche Intelligente",
    description: "Trouvez instantanément ce que vous cherchez. Recherche globale, filtrage avancé et suggestions intelligentes.",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dotColor: "bg-indigo-500",
    image: "/images/demo/smart-search.png",
    features: ["Recherche globale", "Filtrage avancé", "Suggestions intelligentes"]
  },
  {
    icon: BarChart3,
    title: "Analytics & Tableau de Bord",
    description: "Analysez vos performances avec des métriques détaillées. Tableaux de bord personnalisables et rapports en temps réel.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dotColor: "bg-emerald-500",
    image: "/images/demo/dashboard-v2.png",
    features: ["Métriques détaillées", "Tableaux de bord", "Rapports temps réel"]
  }
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
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

        {/* Features Layout - Design en Spirale Innovant */}
        <div className="relative">
          {/* Conteneur principal avec effet de spirale */}
          <div className="relative max-w-6xl mx-auto">
            {/* Ligne de connexion spirale - cachée sur mobile */}
            <div className="hidden lg:block absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#7C3AED]/20 via-[#7C3AED]/40 to-[#7C3AED]/20 rounded-full"></div>
            
            {/* Features en spirale */}
            <div className="space-y-16 sm:space-y-20 lg:space-y-32">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Alternance gauche/droite avec décalage vertical */}
                  <div className={`flex flex-col gap-8 sm:gap-12 lg:flex-row lg:gap-20 ${index % 2 === 0 ? 'lg:flex-row lg:items-start' : 'lg:flex-row-reverse lg:items-end'}`}>
                    
                    {/* Image avec effet de profondeur */}
                    <div className="relative w-full lg:w-1/2">
                      <div className="relative group">
                        {/* Image principale */}
                        <div className="relative h-56 sm:h-64 lg:h-64 rounded-2xl overflow-hidden bg-gray-100">
                          <Image
                            src={feature.image}
                            alt={`${feature.title} - Interface Teamify`}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Éléments décoratifs - cachés sur mobile */}
                        <div className="hidden sm:block absolute -bottom-4 -left-4 w-16 h-16 bg-[#7C3AED]/20 rounded-full blur-xl"></div>
                        <div className="hidden sm:block absolute top-1/2 -right-8 w-12 h-12 bg-blue-500/20 rounded-full blur-lg"></div>
                      </div>
                    </div>

                    {/* Contenu textuel */}
                    <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6 text-center lg:text-left">
                      {/* Badge */}
                      <Badge
                        variant="secondary"
                        className={`${feature.badgeColor} px-4 py-2 text-sm font-medium rounded-full inline-flex items-center gap-2`}
                      >
                        <div className={`w-2 h-2 ${feature.dotColor} rounded-full`}></div>
                        {feature.title}
                      </Badge>

                      {/* Titre */}
                      <h3 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#262626] leading-tight">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-base sm:text-lg text-[#262626]/70 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Liste de fonctionnalités */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {feature.features.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${feature.dotColor} rounded-full flex-shrink-0`}></div>
                            <span className="text-xs sm:text-sm font-medium text-[#262626]">{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="pt-2 sm:pt-4">
                        <button className="bg-[#7C3AED] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-[#7C3AED]/90 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base">
                          En savoir plus
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Point de connexion sur la ligne centrale - caché sur mobile */}
                  <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#7C3AED] rounded-full border-4 border-white shadow-lg"></div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Éléments décoratifs de fond - cachés sur mobile */}
          <div className="hidden sm:block absolute top-20 -left-20 w-40 h-40 bg-[#7C3AED]/5 rounded-full blur-3xl"></div>
          <div className="hidden sm:block absolute bottom-20 -right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

      </div>
    </section>
  );
}