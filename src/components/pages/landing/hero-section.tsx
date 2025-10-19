"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Users, MessageSquare, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Grid */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]"
        )}
      />
      
      {/* Spotlight Effects */}
      <Spotlight
        className="left-0 -top-40 md:-top-20 md:left-60"
        fill="white"
      />
      <Spotlight
        className="right-0 top-40 md:top-20 md:right-60"
        fill="purple"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Badge
              variant="secondary"
              className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2 text-sm font-medium"
            >
              🚀 Plateforme de gestion d'événements nouvelle génération
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Organisez vos événements
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              avec votre équipe
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Teamify simplifie la gestion de vos événements, la communication d'équipe 
            et l'organisation de vos projets. Tout en un, gratuit et puissant.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
            >
              <Link href="/auth/login" className="flex items-center gap-2">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10 px-8 py-4 text-lg font-semibold rounded-2xl backdrop-blur-sm"
            >
              <Link href="#features" className="flex items-center gap-2">
                Découvrir les fonctionnalités
              </Link>
            </Button>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {[
              { icon: Calendar, label: "Événements", color: "text-blue-400" },
              { icon: Users, label: "Équipes", color: "text-green-400" },
              { icon: MessageSquare, label: "Messagerie", color: "text-purple-400" },
              { icon: Bell, label: "Notifications", color: "text-orange-400" },
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
                <span className="text-sm font-medium text-gray-300">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 flex justify-center"
          >
            <div className="relative">
              <Image
                src="/images/logo/noir-rb.png"
                alt="Teamify Logo"
                width={200}
                height={60}
                className="opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
