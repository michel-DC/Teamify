"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useSidebarState } from "@/hooks/useSidebarState";

type SidebarPreference = "auto" | "always-collapsed";

export function PreferencesSection() {
  const { userPreference, setUserPreference, isInitialized } =
    useSidebarState();

  const handleSidebarPreferenceChange = (preference: SidebarPreference) => {
    try {
      setUserPreference(preference);

      if (preference === "auto") {
        toast.success("Préférence de sidebar réinitialisée");
      } else {
        toast.success("Sidebar configurée pour rester fermée");
      }

      // Recharger la page pour appliquer les changements
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des préférences:", error);
      toast.error("Erreur lors de la sauvegarde des préférences");
    }
  };

  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Préférences</h2>
          <p className="text-muted-foreground">
            Personnalisez l'interface selon vos préférences
          </p>
        </div>
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Préférences</h2>
        <p className="text-muted-foreground">
          Personnalisez l'interface selon vos préférences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PanelLeft className="h-5 w-5" />
            Préférences de la sidebar
          </CardTitle>
          <CardDescription>
            Configurez le comportement de la sidebar dans votre interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sidebar-auto" className="text-base font-medium">
                Mode automatique
              </Label>
              <p className="text-sm text-muted-foreground">
                La sidebar se souvient de votre dernier état (ouverte/fermée)
              </p>
            </div>
            <Switch
              id="sidebar-auto"
              checked={userPreference === "auto"}
              onCheckedChange={(checked) =>
                handleSidebarPreferenceChange(
                  checked ? "auto" : "always-collapsed"
                )
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="sidebar-collapsed"
                className="text-base font-medium"
              >
                Toujours fermée
              </Label>
              <p className="text-sm text-muted-foreground">
                La sidebar restera toujours fermée par défaut
              </p>
            </div>
            <Switch
              id="sidebar-collapsed"
              checked={userPreference === "always-collapsed"}
              onCheckedChange={(checked) =>
                handleSidebarPreferenceChange(
                  checked ? "always-collapsed" : "auto"
                )
              }
            />
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <PanelLeftClose className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Note importante</p>
                <p className="text-sm text-muted-foreground">
                  Les changements de préférences nécessitent un rechargement de
                  la page pour être appliqués. Vous pouvez toujours utiliser le
                  bouton de la sidebar pour l'ouvrir temporairement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
