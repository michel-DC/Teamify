"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const faqCategories = [
  {
    id: 1,
    name: "Général",
    icon: "❓",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: 2,
    name: "Événements",
    icon: "📅",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    id: 3,
    name: "Organisations",
    icon: "👥",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    id: 4,
    name: "Support",
    icon: "🛠️",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
];

const faqItems = [
  {
    id: 1,
    question: "Comment fonctionne Teamify ?",
    answer:
      "Teamify est une plateforme complète qui vous permet de créer des organisations, organiser des événements et communiquer en temps réel avec vos équipes. Vous pouvez inviter des membres, assigner des rôles et suivre toutes vos activités depuis un tableau de bord unifié.",
    category: "Général",
  },
  {
    id: 2,
    question: "Puis-je créer plusieurs organisations ?",
    answer:
      "Oui ! Vous pouvez créer autant d'organisations que nécessaire. Chaque organisation peut avoir ses propres membres, événements et conversations. Parfait pour gérer différents projets ou équipes séparément.",
    category: "Organisations",
  },
  {
    id: 3,
    question: "Comment fonctionne la messagerie temps réel ?",
    answer:
      "La messagerie Teamify utilise des technologies WebSocket pour des conversations instantanées. Vous pouvez créer des conversations privées ou de groupe, recevoir des notifications en temps réel et partager des fichiers avec votre équipe.",
    category: "Événements",
  },
  {
    id: 4,
    question: "Puis-je inviter des participants externes à mes événements ?",
    answer:
      "Absolument ! Vous pouvez inviter des participants externes à vos événements via des liens d'invitation ou des emails automatiques. Ils n'ont pas besoin d'être membres de votre organisation pour participer.",
    category: "Événements",
  },
  {
    id: 5,
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Oui, la sécurité est notre priorité. Toutes vos données sont chiffrées, sauvegardées régulièrement et protégées par des mesures de sécurité avancées. Nous respectons le RGPD et les standards de sécurité les plus élevés.",
    category: "Général",
  },
  {
    id: 6,
    question: "Quel type de support proposez-vous ?",
    answer:
      "Nous proposons un support par email pour tous les utilisateurs, avec des temps de réponse rapides. Pour les organisations avec de nombreux membres, nous offrons un support prioritaire et des sessions de formation personnalisées.",
    category: "Support",
  },
  {
    id: 7,
    question: "Puis-je personnaliser les rôles dans mes organisations ?",
    answer:
      "Oui ! Vous pouvez créer des rôles personnalisés avec des permissions spécifiques. Définissez qui peut créer des événements, inviter des membres, accéder aux analytics, etc. Un contrôle total sur les accès de votre équipe.",
    category: "Organisations",
  },
  {
    id: 8,
    question: "Y a-t-il des limites sur le nombre d'événements ?",
    answer:
      "Non, vous pouvez créer autant d'événements que vous le souhaitez dans vos organisations. Il n'y a pas de limite sur le nombre d'événements, de participants ou de conversations.",
    category: "Événements",
  },
  {
    id: 9,
    question: "Comment puis-je analyser les performances de mes événements ?",
    answer:
      "Teamify propose des analytics détaillés : taux de participation, engagement des membres, statistiques de messagerie et bien plus. Accédez à des tableaux de bord personnalisables pour suivre vos KPIs.",
    category: "Événements",
  },
];

export function FAQSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  function toggleItem(id: number) {
    setOpenItem(openItem === id ? null : id);
  }

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 relative overflow-hidden"
      id="faq"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
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
            Questions fréquentes
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#262626] mb-6">
            Vous avez des{" "}
            <span className="text-[#7C3AED]">questions</span> ?
          </h2>
          
          <p className="text-lg sm:text-xl text-[#262626]/70 max-w-3xl mx-auto leading-relaxed">
            Trouvez rapidement les réponses à vos questions les plus fréquentes.
            Notre équipe est également là pour vous aider.
          </p>
        </motion.div>

        {/* Catégories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-8 sm:mb-12"
        >
          {faqCategories.map((category) => (
            <div
              key={category.id}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${category.color}`}
            >
              <span className="text-base">{category.icon}</span>
              {category.name}
            </div>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="space-y-4 sm:space-y-6"
        >
          {faqItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                {/* Question */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    {/* Badge de catégorie */}
                    <div
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        faqCategories.find((cat) => cat.name === item.category)
                          ?.color || "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {item.category}
                    </div>

                    {/* Question */}
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[#262626] leading-relaxed">
                      {item.question}
                    </h3>
                  </div>

                  {/* Icône de toggle */}
                  <div
                    className={`ml-4 flex-shrink-0 transition-transform duration-200 ${
                      openItem === item.id ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Réponse */}
                <AnimatePresence>
                  {openItem === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="border-t border-gray-200 pt-4 sm:pt-6">
                          <p className="text-sm sm:text-base text-[#262626]/70 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Éléments décoratifs de fond */}
      <div className="hidden sm:block absolute top-20 left-0 w-32 h-32 bg-[#7C3AED]/5 rounded-full blur-3xl"></div>
      <div className="hidden sm:block absolute bottom-20 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
    </section>
  );
}
