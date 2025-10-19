"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Créez votre organisation",
    description: "Créez votre organisation et invitez vos premiers membres. Définissez les rôles et permissions selon vos besoins.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    features: ["Invitation par email", "Rôles personnalisés", "Gestion des permissions"]
  },
  {
    number: "02",
    icon: Calendar,
    title: "Organisez vos événements",
    description: "Créez et planifiez vos événements avec tous les détails nécessaires. Invitez les participants et gérez les inscriptions.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    features: ["Planification détaillée", "Invitations automatiques", "Gestion des participants"]
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Communiquez en équipe",
    description: "Utilisez la messagerie intégrée pour communiquer avec votre équipe. Conversations privées et de groupe en temps réel.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    features: ["Messages instantanés", "Conversations de groupe", "Notifications temps réel"]
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Analysez vos résultats",
    description: "Consultez les métriques et analyses de vos événements. Suivez les performances et optimisez vos processus.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    features: ["Tableaux de bord", "Métriques détaillées", "Rapports personnalisés"]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
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
            Comment ça marche
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Commencez en{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              4 étapes simples
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            De la création de votre organisation à l'analyse de vos résultats, 
            découvrez comment Teamify simplifie votre gestion d'événements.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={itemVariants} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-8 top-24 w-0.5 h-16 bg-gradient-to-b from-purple-500/50 to-transparent" />
              )}
              
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center relative",
                    step.bgColor,
                    step.borderColor,
                    "border"
                  )}>
                    <step.icon className={cn("w-8 h-8", step.color)} />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <Card className={cn(
                    "bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300",
                    step.borderColor
                  )}>
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white mb-2">
                        {step.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg leading-relaxed">
                        {step.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {step.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3 text-gray-400">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-purple-400" />
                  </div>
                )}
              </div>
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
              Prêt à commencer votre première organisation ?
            </h3>
            <p className="text-gray-300 mb-6">
              Créez votre compte gratuitement et découvrez la puissance de Teamify
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Gratuit pour toujours</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Aucune carte de crédit requise</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Support inclus</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
