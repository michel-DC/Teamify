"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Calendar,
    title: "Gestion d'Événements",
    description: "Créez, planifiez et gérez vos événements avec des outils puissants. Suivi en temps réel, invitations automatiques et gestion des participants.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    features: ["Planification avancée", "Invitations automatiques", "Suivi en temps réel"]
  },
  {
    icon: Users,
    title: "Gestion d'Organisations",
    description: "Organisez vos équipes avec des rôles personnalisés. Gérez les permissions, invitez des membres et structurez vos projets.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    features: ["Rôles personnalisés", "Gestion des permissions", "Invitations d'équipe"]
  },
  {
    icon: MessageSquare,
    title: "Messagerie Temps Réel",
    description: "Communiquez instantanément avec votre équipe. Conversations privées et de groupe avec notifications en temps réel.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    features: ["Messages instantanés", "Conversations de groupe", "Notifications temps réel"]
  },
  {
    icon: Bell,
    title: "Système de Notifications",
    description: "Restez informé de toutes les activités importantes. Notifications intelligentes et personnalisables pour ne rien manquer.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    features: ["Notifications intelligentes", "Personnalisation", "Multi-canaux"]
  },
  {
    icon: BarChart3,
    title: "Analytics & Rapports",
    description: "Analysez les performances de vos événements et équipes. Tableaux de bord détaillés et métriques en temps réel.",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    features: ["Tableaux de bord", "Métriques temps réel", "Rapports détaillés"]
  },
  {
    icon: Shield,
    title: "Sécurité & Confidentialité",
    description: "Vos données sont protégées avec les meilleures pratiques de sécurité. Authentification robuste et chiffrement des données.",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    features: ["Authentification sécurisée", "Chiffrement des données", "Conformité RGPD"]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2 text-sm font-medium mb-4"
          >
            Fonctionnalités
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Tout ce dont vous avez besoin pour{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              organiser vos événements
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Une plateforme complète qui simplifie la gestion d'événements, 
            la communication d'équipe et l'organisation de vos projets.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className={cn(
                "h-full bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group",
                feature.borderColor
              )}>
                <CardHeader className="pb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    feature.bgColor
                  )}>
                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Prêt à transformer votre gestion d'événements ?
            </h3>
            <p className="text-gray-300 mb-6">
              Rejoignez des milliers d'organisations qui font confiance à Teamify
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Démarrage en 2 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Disponible partout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>100% sécurisé</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
