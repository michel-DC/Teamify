"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight
} from "lucide-react";

const organizationTypes = [
  {
    emoji: "🤝",
    name: "Associations",
    description: "Gérez vos événements caritatifs et communautaires avec des outils adaptés aux besoins associatifs.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
    features: ["Événements caritatifs", "Gestion bénévoles", "Communication communautaire"]
  },
  {
    emoji: "🏢",
    name: "PME",
    description: "Organisez vos réunions et formations d'équipe avec des fonctionnalités professionnelles.",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
    features: ["Réunions d'équipe", "Formations internes", "Suivi des performances"]
  },
  {
    emoji: "💼",
    name: "Entreprises",
    description: "Planifiez vos séminaires et conférences corporate avec des outils enterprise.",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
    features: ["Séminaires corporate", "Conférences", "Gestion multi-sites"]
  },
  {
    emoji: "🚀",
    name: "Startups",
    description: "Créez vos événements de networking et pitch avec des outils innovants.",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    dotColor: "bg-orange-500",
    features: ["Networking events", "Pitch sessions", "Croissance rapide"]
  },
  {
    emoji: "👤",
    name: "Auto-entrepreneurs",
    description: "Organisez vos ateliers et formations individuelles avec simplicité.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dotColor: "bg-indigo-500",
    features: ["Ateliers individuels", "Formations", "Gestion autonome"]
  }
];

const eventCategories = [
  { emoji: "📅", name: "Réunions", color: "text-blue-500", bgColor: "bg-blue-50" },
  { emoji: "🎓", name: "Formations", color: "text-green-500", bgColor: "bg-green-50" },
  { emoji: "🎤", name: "Conférences", color: "text-purple-500", bgColor: "bg-purple-50" },
  { emoji: "👥", name: "Séminaires", color: "text-orange-500", bgColor: "bg-orange-50" },
  { emoji: "🤝", name: "Networking", color: "text-indigo-500", bgColor: "bg-indigo-50" },
  { emoji: "🏆", name: "Cérémonies", color: "text-pink-500", bgColor: "bg-pink-50" },
  { emoji: "🎨", name: "Expositions", color: "text-teal-500", bgColor: "bg-teal-50" },
  { emoji: "🎵", name: "Concerts", color: "text-red-500", bgColor: "bg-red-50" },
  { emoji: "🎭", name: "Spectacles", color: "text-yellow-500", bgColor: "bg-yellow-50" },
  { emoji: "🔧", name: "Ateliers", color: "text-gray-500", bgColor: "bg-gray-50" }
];

export function OrganizationsEventsSection() {
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
            Pour tous les secteurs
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#262626] mb-6">
            Adapté à{" "}
            <span className="text-[#7C3AED]">votre organisation</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-[#262626]/70 max-w-3xl mx-auto leading-relaxed">
            Que vous soyez une association, une PME, une startup ou un auto-entrepreneur, 
            Teamify s'adapte à vos besoins et à votre secteur d'activité.
          </p>
        </motion.div>

        {/* Organization Types */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#262626] mb-4">
              Types d'organisations
            </h3>
            <p className="text-base text-[#262626]/60 max-w-2xl mx-auto">
              Chaque type d'organisation bénéficie d'outils adaptés à ses spécificités
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {organizationTypes.map((org, index) => (
              <motion.div
                key={org.name}
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative ${org.bgColor} ${org.borderColor} border rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 h-full flex flex-col group cursor-pointer`}
              >
                {/* Badge */}
                <Badge
                  variant="secondary"
                  className={`${org.badgeColor} px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-2 mb-4`}
                >
                  <div className={`w-1.5 h-1.5 ${org.dotColor} rounded-full`}></div>
                  Organisation
                </Badge>

                {/* Icon */}
                <div className="mb-4">
                  <div className={`w-12 h-12 ${org.bgColor} ${org.borderColor} border rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{org.emoji}</span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xl sm:text-2xl font-bold text-[#262626] mb-3 leading-tight">
                  {org.name}
                </h4>
                
                {/* Description */}
                <p className="text-sm sm:text-base text-[#262626]/70 leading-relaxed mb-4 flex-grow">
                  {org.description}
                </p>

                {/* Features List */}
                <div className="space-y-2">
                  {org.features.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 ${org.dotColor} rounded-full flex-shrink-0`}></div>
                      <span className="text-xs sm:text-sm font-medium text-[#262626]/80">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Event Categories */}
        <div className="relative">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#262626] mb-4">
              Types d'événements supportés
            </h3>
            <p className="text-base text-[#262626]/60 max-w-2xl mx-auto">
              Plus de 10 catégories d'événements pour couvrir tous vos besoins
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4 sm:gap-6">
            {eventCategories.map((event, index) => (
              <motion.div
                key={event.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex flex-col items-center bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-[#7C3AED]/20"
              >
                <div className={`w-10 h-10 ${event.bgColor} rounded-lg flex items-center justify-center mb-2 group-hover:bg-[#7C3AED]/10 transition-colors`}>
                  <span className="text-xl">{event.emoji}</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#262626] group-hover:text-[#7C3AED] text-center">
                  {event.name}
                </span>
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
