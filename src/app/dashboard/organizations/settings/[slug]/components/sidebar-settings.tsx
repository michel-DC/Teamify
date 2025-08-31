"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Building2, Users, Shield, Settings, ChevronRight } from "lucide-react";

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: "OWNER" | "ADMIN" | "MEMBER" | null;
}

const sections = [
  {
    id: "general",
    label: "Informations générales",
    icon: Building2,
    description: "Modifier les informations de l'organisation",
    roles: ["OWNER", "ADMIN"],
  },
  {
    id: "members",
    label: "Gestion des membres",
    icon: Users,
    description: "Gérer les membres et leurs rôles",
    roles: ["OWNER", "ADMIN"],
  },
  {
    id: "permissions",
    label: "Autorisations",
    icon: Shield,
    description: "Configurer les permissions",
    roles: ["OWNER"],
  },
];

export function SettingsSidebar({
  activeSection,
  onSectionChange,
  userRole,
}: SettingsSidebarProps) {
  const filteredSections = sections.filter((section) =>
    section.roles.includes(userRole || "")
  );

  return (
    <div className="w-80 bg-card border-r border-border h-full overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Paramètres</h2>
        </div>

        <nav className="space-y-2">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <Button
                key={section.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto p-3 text-left",
                  isActive && "bg-secondary text-secondary-foreground"
                )}
                onClick={() => onSectionChange(section.id)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="font-medium truncate w-full">
                    {section.label}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {section.description}
                  </span>
                </div>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0" />
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
