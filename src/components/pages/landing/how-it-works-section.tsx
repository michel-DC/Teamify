"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  PlayCircle
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Créez votre organisation",
    description: "Créez votre organisation et invitez vos premiers membres. Définissez les rôles et permissions selon vos besoins.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
    features: ["Invitation par email", "Rôles personnalisés", "Gestion des permissions"],
    image: "/images/demo/create-organization.png"
  },
  {
    number: "02",
    icon: Calendar,
    title: "Organisez vos événements",
    description: "Créez et planifiez vos événements avec tous les détails nécessaires. Invitez les participants et gérez les inscriptions.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
    features: ["Planification détaillée", "Invitations automatiques", "Gestion des participants"],
    image: "/images/demo/create-event.png"
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Communiquez en équipe",
    description: "Utilisez la messagerie intégrée pour communiquer avec votre équipe. Conversations privées et de groupe en temps réel.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
    features: ["Messages instantanés", "Conversations de groupe", "Notifications temps réel"],
    image: "/images/demo/messaging.png"
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Analysez vos résultats",
    description: "Consultez les métriques et analyses de vos événements. Suivez les performances et optimisez vos processus.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    dotColor: "bg-orange-500",
    features: ["Tableaux de bord", "Métriques détaillées", "Rapports personnalisés"],
    image: "/images/demo/dashboard-v2.png"
  }
];

export function HowItWorksSection() {
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
            Comment ça marche
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#262626] mb-6">
            Commencez en{" "}
            <span className="text-[#7C3AED]">4 étapes simples</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-[#262626]/70 max-w-3xl mx-auto leading-relaxed">
            De la création de votre organisation à l'analyse de vos résultats, 
            découvrez comment Teamify simplifie votre gestion d'événements.
          </p>
        </motion.div>

        {/* Steps Layout - Design Vertical avec Images */}
        <div className="relative">
          {/* Ligne de connexion verticale - cachée sur mobile */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-[calc(100%-4rem)] bg-gradient-to-b from-[#7C3AED]/20 via-[#7C3AED]/40 to-[#7C3AED]/20 rounded-full"></div>
          
          {/* Steps */}
          <div className="space-y-16 sm:space-y-20 lg:space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Alternance gauche/droite */}
                <div className={`flex flex-col gap-8 sm:gap-12 lg:flex-row lg:gap-20 ${index % 2 === 0 ? 'lg:flex-row lg:items-center' : 'lg:flex-row-reverse lg:items-center'}`}>
                  
                  {/* Image avec effet de profondeur */}
                  <div className="relative w-full lg:w-1/2">
                    <div className="relative group">
                      {/* Image principale */}
                      <div className="relative h-48 sm:h-52 lg:h-60 rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
                        <img
                          src={step.image}
                          alt={`${step.title} - Interface Teamify`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Éléments décoratifs */}
                      <div className="hidden sm:block absolute -bottom-2 left-2 w-12 h-12 bg-[#7C3AED]/20 rounded-full blur-xl"></div>
                      <div className="hidden sm:block absolute top-1/2 right-2 w-8 h-8 bg-blue-500/20 rounded-full blur-lg"></div>
                    </div>
                  </div>

                  {/* Contenu textuel */}
                  <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6 text-center lg:text-left">
                    {/* Badge avec numéro */}
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      <Badge
                        variant="secondary"
                        className={`${step.badgeColor} px-4 py-2 text-sm font-medium rounded-full inline-flex items-center gap-2`}
                      >
                        <div className={`w-2 h-2 ${step.dotColor} rounded-full`}></div>
                        Étape {step.number}
                      </Badge>
                    </div>

                    {/* Titre */}
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#262626] leading-tight">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-base sm:text-lg text-[#262626]/70 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Liste de fonctionnalités */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {step.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${step.dotColor} rounded-full flex-shrink-0`}></div>
                          <span className="text-xs sm:text-sm font-medium text-[#262626]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Point de connexion sur la ligne centrale - caché sur mobile */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#7C3AED] rounded-full border-4 border-white shadow-lg z-10"></div>
              </motion.div>
            ))}
          </div>
        </div>


        {/* Éléments décoratifs de fond */}
        <div className="hidden sm:block absolute top-20 left-0 w-32 h-32 bg-[#7C3AED]/5 rounded-full blur-3xl"></div>
        <div className="hidden sm:block absolute bottom-20 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
