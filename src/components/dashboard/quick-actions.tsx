"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Settings, BarChart3, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";

export function QuickActions() {
  const { activeOrganization } = useActiveOrganization();

  const actions = [
    {
      title: "Créer un événement",
      description: "Lancez un nouvel événement",
      icon: <Plus className="h-5 w-5" />,
      href: "/dashboard/events/new",
      variant: "default" as const,
    },
    {
      title: "Gérer les invitations",
      description: "Voir et gérer les invitations",
      icon: <Mail className="h-5 w-5" />,
      href: "/dashboard/events/invitations",
      variant: "default" as const,
    },
    {
      title: "Gérer les membres",
      description: "Ajouter ou modifier des membres",
      icon: <Users className="h-5 w-5" />,
      href: activeOrganization
        ? `/dashboard/organizations/settings/${activeOrganization.publicId}/members`
        : "#",
      variant: "default" as const,
    },
    {
      title: "Paramètres",
      description: "Configurer l'organisation",
      icon: <Settings className="h-5 w-5" />,
      href: activeOrganization
        ? `/dashboard/organizations/settings/${activeOrganization.publicId}`
        : "#",
      variant: "outline" as const,
    },
    {
      title: "Statistiques",
      description: "Voir les analyses détaillées",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/dashboard/events",
      variant: "outline" as const,
    },
    {
      title: "Localisations",
      description: "Gérer les lieux",
      icon: <MapPin className="h-5 w-5" />,
      href: "/dashboard/events#maps-section",
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant={action.variant}
                className="w-full h-auto p-4 flex flex-col items-center gap-2"
              >
                <div>{action.icon}</div>
                <div className="text-center">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs opacity-80 mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
