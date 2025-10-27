"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Bell, 
  Search, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import Image from "next/image";

interface FeatureDetail {
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  dotColor: string;
  image: string;
  features: string[];
  benefits: string[];
  useCases: string[];
  technicalSpecs: string[];
}

const featureDetails: Record<string, FeatureDetail> = {
  "Création d'Événements": {
    title: "Création d'Événements",
    description: "Créez, planifiez et gérez vos événements avec des outils puissants.",
    detailedDescription: "Transformez votre façon d'organiser des événements avec notre plateforme complète. De la planification initiale à l'analyse post-événement, Teamify vous accompagne à chaque étape.",
    icon: Calendar,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
    image: "/images/demo/create-event.png",
    features: ["Planification avancée", "Invitations automatiques", "Suivi en temps réel"],
    benefits: [
      "Gain de temps considérable dans l'organisation",
      "Réduction des erreurs de communication",
      "Amélioration du taux de participation",
      "Suivi précis des inscriptions et présences"
    ],
    useCases: [
      "Événements d'entreprise et conférences",
      "Formations et ateliers internes",
      "Événements communautaires et associatifs",
      "Webinaires et événements virtuels"
    ],
    technicalSpecs: [
      "Interface intuitive avec drag & drop",
      "Synchronisation calendrier automatique",
      "Notifications push et email",
      "API REST complète pour intégrations"
    ]
  },
  "Création d'Organisations": {
    title: "Création d'Organisations",
    description: "Créez vos organisations avec des rôles personnalisés.",
    detailedDescription: "Structurez vos équipes et projets avec un système de rôles flexible. Gérez les permissions, invitez des membres et créez une hiérarchie adaptée à vos besoins organisationnels.",
    icon: Users,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
    image: "/images/demo/create-organization.png",
    features: ["Rôles personnalisés", "Gestion des permissions", "Invitations d'équipe"],
    benefits: [
      "Structure organisationnelle claire",
      "Contrôle granulaire des accès",
      "Facilitation de la collaboration",
      "Gestion centralisée des membres"
    ],
    useCases: [
      "Entreprises avec plusieurs départements",
      "Associations et organisations à but non lucratif",
      "Projets collaboratifs multi-équipes",
      "Communautés en ligne structurées"
    ],
    technicalSpecs: [
      "Système de rôles hiérarchique",
      "Permissions granulaires par fonctionnalité",
      "Invitations par email avec codes d'accès",
      "Audit trail complet des actions"
    ]
  },
  "Messagerie Temps Réel": {
    title: "Messagerie Temps Réel",
    description: "Communiquez instantanément avec votre équipe.",
    detailedDescription: "Restez connecté avec votre équipe grâce à notre système de messagerie en temps réel. Conversations privées, groupes de discussion et notifications instantanées pour une communication fluide.",
    icon: MessageSquare,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
    image: "/images/demo/messaging.png",
    features: ["Messages instantanés", "Conversations de groupe", "Notifications temps réel"],
    benefits: [
      "Communication instantanée et efficace",
      "Réduction des emails internes",
      "Historique des conversations accessible",
      "Intégration avec les événements et projets"
    ],
    useCases: [
      "Coordination d'équipe en temps réel",
      "Support client et assistance",
      "Discussions de projet et brainstorming",
      "Communication d'urgence et alertes"
    ],
    technicalSpecs: [
      "WebSocket pour la communication temps réel",
      "Chiffrement end-to-end des messages",
      "Système de mentions et notifications",
      "Support des fichiers et médias"
    ]
  },
  "Système de Notifications": {
    title: "Système de Notifications",
    description: "Restez informé en temps réel.",
    detailedDescription: "Ne manquez jamais une information importante avec notre système de notifications intelligent. Personnalisez vos alertes selon vos préférences et restez toujours à jour.",
    icon: Bell,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    dotColor: "bg-orange-500",
    image: "/images/demo/notifications.png",
    features: ["Notifications push", "Emails automatiques", "Alertes personnalisées"],
    benefits: [
      "Information en temps réel",
      "Réduction des oublis et retards",
      "Personnalisation des alertes",
      "Intégration multi-canal"
    ],
    useCases: [
      "Rappels d'événements et deadlines",
      "Notifications de nouveaux messages",
      "Alertes de sécurité et accès",
      "Mises à jour de statut de projet"
    ],
    technicalSpecs: [
      "Notifications push web et mobile",
      "Templates d'email personnalisables",
      "Système de préférences granulaire",
      "Analytics des taux d'ouverture"
    ]
  },
  "Recherche Intelligente": {
    title: "Recherche Intelligente",
    description: "Trouvez instantanément ce que vous cherchez.",
    detailedDescription: "Localisez rapidement toute information avec notre moteur de recherche avancé. Filtres intelligents, suggestions contextuelles et recherche globale pour une efficacité maximale.",
    icon: Search,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dotColor: "bg-indigo-500",
    image: "/images/demo/smart-search.png",
    features: ["Recherche globale", "Filtrage avancé", "Suggestions intelligentes"],
    benefits: [
      "Gain de temps dans la recherche d'informations",
      "Découverte de contenu pertinent",
      "Interface de recherche intuitive",
      "Résultats contextuels et précis"
    ],
    useCases: [
      "Recherche d'événements passés et futurs",
      "Localisation de conversations spécifiques",
      "Trouver des membres d'équipe",
      "Recherche dans les documents partagés"
    ],
    technicalSpecs: [
      "Indexation en temps réel du contenu",
      "Algorithme de scoring intelligent",
      "Recherche sémantique et par mots-clés",
      "Cache de résultats optimisé"
    ]
  },
  "Analytics & Tableau de Bord": {
    title: "Analytics & Tableau de Bord",
    description: "Analysez vos performances avec des métriques détaillées.",
    detailedDescription: "Prenez des décisions éclairées grâce à nos tableaux de bord analytiques. Métriques en temps réel, rapports personnalisés et insights pour optimiser vos performances.",
    icon: BarChart3,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dotColor: "bg-emerald-500",
    image: "/images/demo/dashboard-v2.png",
    features: ["Métriques détaillées", "Tableaux de bord", "Rapports temps réel"],
    benefits: [
      "Visibilité complète sur les performances",
      "Identification des tendances et patterns",
      "Optimisation basée sur les données",
      "Rapports automatisés et personnalisables"
    ],
    useCases: [
      "Analyse de participation aux événements",
      "Métriques d'engagement des équipes",
      "Suivi des performances de communication",
      "Rapports de productivité et efficacité"
    ],
    technicalSpecs: [
      "Collecte de données en temps réel",
      "Visualisations interactives et personnalisables",
      "Export de données en multiple formats",
      "API d'analytics pour intégrations tierces"
    ]
  }
};

interface FeatureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle: string;
}

export function FeatureDetailModal({ isOpen, onClose, featureTitle }: FeatureDetailModalProps) {
  const feature = featureDetails[featureTitle];
  
  if (!feature) return null;

  const IconComponent = feature.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DialogHeader className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${feature.bgColor} ${feature.borderColor} border`}>
                <IconComponent className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-[#262626]">
                  {feature.title}
                </DialogTitle>
                <p className="text-[#262626]/70 mt-1">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          </DialogHeader>

          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Description détaillée */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#262626] flex items-center gap-2">
                <Star className="w-5 h-5 text-[#7C3AED]" />
                À propos de cette fonctionnalité
              </h3>
              <p className="text-[#262626]/80 leading-relaxed">
                {feature.detailedDescription}
              </p>
            </div>

            {/* Fonctionnalités principales */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#262626] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#7C3AED]" />
                Fonctionnalités principales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feature.features.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-2 h-2 ${feature.dotColor} rounded-full flex-shrink-0`}></div>
                    <span className="text-sm font-medium text-[#262626]">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Avantages */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#262626] flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#7C3AED]" />
                Avantages clés
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feature.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#262626]">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Cas d'usage */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#262626] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#7C3AED]" />
                Cas d'usage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feature.useCases.map((useCase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#262626]">{useCase}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.div
              className="pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={onClose}
                  className="bg-[#7C3AED] text-white hover:bg-[#7C3AED]/90 transition-all duration-300 shadow-lg px-8 py-3 rounded-xl font-semibold cursor-pointer"
                >
                  Commencer maintenant
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all duration-300 px-8 py-3 rounded-xl font-semibold cursor-pointer"
                >
                  Fermer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
