"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah Dubois",
    role: "Directrice d'événements",
    company: "TechCorp",
    avatar: "/images/testimonials/sarah.jpg",
    content: "Teamify a révolutionné notre gestion d'événements. L'interface est intuitive et les fonctionnalités de messagerie en temps réel sont parfaites pour coordonner nos équipes.",
    rating: 5,
    color: "text-blue-400"
  },
  {
    name: "Marc Leroy",
    role: "Fondateur",
    company: "StartupHub",
    avatar: "/images/testimonials/marc.jpg",
    content: "La gestion des organisations et des rôles est exceptionnelle. Nous pouvons facilement inviter nos clients et gérer les permissions selon nos besoins.",
    rating: 5,
    color: "text-green-400"
  },
  {
    name: "Emma Martin",
    role: "Responsable marketing",
    company: "EventPro",
    avatar: "/images/testimonials/emma.jpg",
    content: "Les analytics et les rapports nous donnent une visibilité complète sur nos événements. C'est exactement ce dont nous avions besoin pour optimiser nos processus.",
    rating: 5,
    color: "text-purple-400"
  },
  {
    name: "Thomas Moreau",
    role: "Organisateur d'événements",
    company: "Creative Events",
    avatar: "/images/testimonials/thomas.jpg",
    content: "L'intégration des notifications et la messagerie temps réel ont considérablement amélioré notre communication d'équipe. Tout est fluide et professionnel.",
    rating: 5,
    color: "text-orange-400"
  },
  {
    name: "Lisa Chen",
    role: "CEO",
    company: "InnovateLab",
    avatar: "/images/testimonials/lisa.jpg",
    content: "Teamify nous a permis de passer d'une gestion chaotique à une organisation parfaitement structurée. Nos événements sont maintenant des succès garantis.",
    rating: 5,
    color: "text-pink-400"
  },
  {
    name: "David Rodriguez",
    role: "Directeur des opérations",
    company: "Global Events",
    avatar: "/images/testimonials/david.jpg",
    content: "La sécurité et la fiabilité de la plateforme sont impressionnantes. Nous gérons des événements internationaux sans aucun problème technique.",
    rating: 5,
    color: "text-indigo-400"
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

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
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
            Témoignages
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ce que disent nos{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              utilisateurs
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez comment Teamify transforme la gestion d'événements 
            pour des milliers d'organisations dans le monde.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={testimonial.name} variants={itemVariants}>
              <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className={cn("w-8 h-8", testimonial.color)} />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-gray-300 leading-relaxed mb-6">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-purple-500/20 text-purple-300">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                      <div className="text-sm text-purple-300">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { number: "10,000+", label: "Organisations actives", color: "text-blue-400" },
            { number: "50,000+", label: "Événements organisés", color: "text-green-400" },
            { number: "99.9%", label: "Temps de disponibilité", color: "text-purple-400" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={cn("text-4xl font-bold mb-2", stat.color)}>
                {stat.number}
              </div>
              <div className="text-gray-300 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
