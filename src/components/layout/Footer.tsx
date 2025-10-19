"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github,
  Calendar,
  Users,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Fonctionnalités", href: "#features" },
      { name: "Comment ça marche", href: "#how-it-works" },
      { name: "Témoignages", href: "#testimonials" },
      { name: "Tarifs", href: "#pricing" },
    ],
    company: [
      { name: "À propos", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Carrières", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "Support", href: "/support" },
      { name: "API", href: "/api" },
      { name: "Statut", href: "/status" },
    ],
    legal: [
      { name: "Mentions légales", href: "/legal-notice" },
      { name: "Politique de confidentialité", href: "/privacy-policy" },
      { name: "Conditions d'utilisation", href: "/terms-of-use" },
      { name: "Cookies", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/teamify", icon: Twitter },
    { name: "LinkedIn", href: "https://linkedin.com/company/teamify", icon: Linkedin },
    { name: "GitHub", href: "https://github.com/michel-dc/Teamify", icon: Github },
  ];

  const features = [
    { icon: Calendar, name: "Événements" },
    { icon: Users, name: "Équipes" },
    { icon: MessageSquare, name: "Messagerie" },
    { icon: BarChart3, name: "Analytics" },
  ];

  return (
    <footer className="relative w-full bg-gradient-to-b from-slate-900 to-black text-white">
      {/* Background Grid */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]"
        )}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="flex items-center mb-6">
                <Image
                  width={120}
                  height={40}
                  src="/images/logo/noir-rb.png"
                  alt="Teamify Logo"
                  className="object-contain h-10 w-auto"
                />
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Simplifiez l'organisation de vos événements avec Teamify. 
                La plateforme complète pour gérer vos équipes et vos projets.
              </p>
              
              {/* Feature Icons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    <feature.icon className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">{feature.name}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <Link href="/auth/login" className="flex items-center gap-2">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Product */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Produit</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Entreprise</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Ressources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Légal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              <p>&copy; {currentYear} Teamify. Tous droits réservés.</p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Suivez-nous :</span>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group"
                >
                  <social.icon className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </motion.a>
              ))}
            </div>

            {/* Badge */}
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1 text-xs"
            >
              🚀 Disponible maintenant
            </Badge>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
