"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  Settings,
  BarChart3,
  Mail,
  MapPin,
  Calendar,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

export function QuickActions() {
  const { activeOrganization } = useActiveOrganization();

  const actions = [
    {
      title: "Créer un événement",
      description: "Lancez un nouvel événement",
      icon: <Plus className="h-4 w-4" />,
      href: "/dashboard/events/new",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-white",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Gérer les invitations",
      description: "Voir et gérer les invitations",
      icon: <Mail className="h-4 w-4" />,
      href: "/dashboard/events/invitations",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-white",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      title: "Gérer les membres",
      description: "Ajouter ou modifier des membres",
      icon: <Users className="h-4 w-4" />,
      href: activeOrganization
        ? `/dashboard/organizations/settings/${activeOrganization.publicId}/members`
        : "#",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-white",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "Paramètres",
      description: "Configurer l'organisation",
      icon: <Settings className="h-4 w-4" />,
      href: activeOrganization
        ? `/dashboard/organizations/settings/${activeOrganization.publicId}`
        : "#",
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-white",
      borderColor: "border-gray-200 dark:border-gray-700",
    },
    {
      title: "Statistiques",
      description: "Voir les analyses détaillées",
      icon: <BarChart3 className="h-4 w-4" />,
      href: "/dashboard/events",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-white",
      borderColor: "border-indigo-200 dark:border-indigo-800",
    },
    {
      title: "Localisations",
      description: "Gérer les lieux",
      icon: <MapPin className="h-4 w-4" />,
      href: "/dashboard/events#maps-section",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-white",
      borderColor: "border-teal-200 dark:border-teal-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header avec titre et description */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Actions rapides
        </h2>
      </div>

      {/* Grille des actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div
              className={`
                rounded-lg border ${action.borderColor} 
                ${action.bgColor} p-4 hover:bg-opacity-80 shadow-md hover:shadow-lg transition-shadow
              `}
            >
              {/* Icon */}
              <div
                className={`
                  inline-flex items-center justify-center w-8 h-8 rounded-lg 
                  ${action.bgColor} ${action.color} mb-3
                `}
              >
                {action.icon}
              </div>

              {/* Contenu */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
