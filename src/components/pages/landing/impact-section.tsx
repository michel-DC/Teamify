"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Zap, 
  Target, 
  CheckCircle,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

const statsData = [
  {
    id: 1,
    icon: "⏱️",
    title: "Temps économisé",
    value: "75%",
    description: "de réduction du temps d'organisation",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500",
    position: "top-left"
  },
  {
    id: 2,
    icon: "👥",
    title: "Collaboration",
    value: "3x",
    description: "plus d'efficacité en équipe",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    dotColor: "bg-green-500",
    position: "top-center"
  },
  {
    id: 3,
    icon: "📈",
    title: "Engagement",
    value: "90%",
    description: "de taux de participation",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    dotColor: "bg-purple-500",
    position: "top-right"
  },
  {
    id: 4,
    icon: "🎯",
    title: "Précision",
    value: "95%",
    description: "d'événements réussis",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    dotColor: "bg-orange-500",
    position: "bottom-left"
  },
  {
    id: 5,
    icon: "⚡",
    title: "Rapidité",
    value: "5min",
    description: "pour créer un événement",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    dotColor: "bg-pink-500",
    position: "bottom-center"
  },
  {
    id: 6,
    icon: "🔒",
    title: "Sécurité",
    value: "100%",
    description: "de données protégées",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    dotColor: "bg-indigo-500",
    position: "bottom-right"
  }
];

const testimonials = [
  {
    quote: "Teamify a transformé notre façon de travailler",
    author: "Marie Dubois",
    role: "Event Manager",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg"
  },
  {
    quote: "Une efficacité incroyable pour nos équipes",
    author: "Thomas Martin",
    role: "Chef de Projet",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg"
  },
  {
    quote: "L'outil parfait pour nos événements",
    author: "Sophie Laurent",
    role: "Coordinatrice",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

function StatCard({ stat, index, isHovered, onHover }: { 
  stat: typeof statsData[0], 
  index: number, 
  isHovered: boolean, 
  onHover: (id: number | null) => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative group cursor-pointer ${stat.bgColor} ${stat.borderColor} border-2 rounded-2xl p-6 transition-all duration-300 ${
        isHovered ? 'scale-105 shadow-xl' : 'hover:scale-105 hover:shadow-lg'
      }`}
      onMouseEnter={() => onHover(stat.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="text-3xl mb-4">{stat.icon}</div>
        
        {/* Value */}
        <div className="text-3xl sm:text-4xl font-bold text-[#262626] mb-2">
          {stat.value}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-[#262626] mb-2">
          {stat.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-[#262626]/70 leading-relaxed">
          {stat.description}
        </p>
        
        {/* Progress indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`w-2 h-2 ${stat.dotColor} rounded-full`}></div>
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1, delay: index * 0.2 }}
              viewport={{ once: true }}
            />
          </div>
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </motion.div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center gap-4 mb-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.author}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
        />
        <div>
          <h4 className="font-semibold text-[#262626]">{testimonial.author}</h4>
          <p className="text-sm text-[#262626]/70">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-[#262626]/80 italic">"{testimonial.quote}"</p>
    </motion.div>
  );
}

export function ImpactSection() {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className=" relative overflow-hidden pt-12"
      id="impact"
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
            Impact & Résultats
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#262626] mb-6">
            Des résultats qui{" "}
            <span className="text-[#7C3AED]">parlent d'eux-mêmes</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-[#262626]/70 max-w-3xl mx-auto leading-relaxed">
            Découvrez comment Teamify transforme la gestion d'événements et booste la productivité de vos équipes.
          </p>
        </motion.div>

        {/* Stats Grid - Layout Hexagonal */}
        <div className="relative mb-16 sm:mb-20">
          {/* Grid Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Top Row */}
            <div className="sm:col-span-2 lg:col-span-3 flex justify-center gap-6 sm:gap-8">
              <StatCard 
                stat={statsData[0]} 
                index={0} 
                isHovered={hoveredStat === statsData[0].id}
                onHover={setHoveredStat}
              />
              <StatCard 
                stat={statsData[1]} 
                index={1} 
                isHovered={hoveredStat === statsData[1].id}
                onHover={setHoveredStat}
              />
              <StatCard 
                stat={statsData[2]} 
                index={2} 
                isHovered={hoveredStat === statsData[2].id}
                onHover={setHoveredStat}
              />
            </div>
            
            {/* Bottom Row */}
            <div className="sm:col-span-2 lg:col-span-3 flex justify-center gap-6 sm:gap-8 mt-6 sm:mt-8">
              <StatCard 
                stat={statsData[3]} 
                index={3} 
                isHovered={hoveredStat === statsData[3].id}
                onHover={setHoveredStat}
              />
              <StatCard 
                stat={statsData[4]} 
                index={4} 
                isHovered={hoveredStat === statsData[4].id}
                onHover={setHoveredStat}
              />
              <StatCard 
                stat={statsData[5]} 
                index={5} 
                isHovered={hoveredStat === statsData[5].id}
                onHover={setHoveredStat}
              />
            </div>
          </div>

          {/* Central Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block"
          >
          </motion.div>
        </div>
      </div>

      {/* Éléments décoratifs de fond */}
      <div className="hidden sm:block absolute top-20 left-0 w-32 h-32 bg-[#7C3AED]/5 rounded-full blur-3xl"></div>
      <div className="hidden sm:block absolute bottom-20 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="hidden sm:block absolute top-1/2 left-1/4 w-24 h-24 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="hidden sm:block absolute top-1/3 right-1/4 w-20 h-20 bg-purple-500/5 rounded-full blur-3xl"></div>
    </section>
  );
}
