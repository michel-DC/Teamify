"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, X, Command } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import {
  Command as CommandComponent,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Composant de recherche globale pour le dashboard
 * S'affiche au centre de l'écran avec Ctrl+K
 */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Données de recherche - toutes les pages et fonctionnalités disponibles
  const searchItems = [
    {
      title: "Tableau de bord",
      description: "Vue d'ensemble de votre organisation",
      url: "/dashboard",
      category: "Navigation",
    },
    {
      title: "Événements",
      description: "Gérer vos événements",
      url: "/dashboard/events",
      category: "Événements",
    },
    {
      title: "Créer un événement",
      description: "Créer un nouvel événement",
      url: "/dashboard/events/new",
      category: "Événements",
    },
    {
      title: "Gestion des invitations",
      description: "Gérer les invitations d'événements",
      url: "/dashboard/events/invitations",
      category: "Événements",
    },
    {
      title: "Mes organisations",
      description: "Gérer vos organisations",
      url: "/dashboard/organizations",
      category: "Organisations",
    },
    {
      title: "Créer une organisation",
      description: "Créer une nouvelle organisation",
      url: "/dashboard/organizations/new",
      category: "Organisations",
    },
    {
      title: "Inviter un membre",
      description: "Inviter des membres à votre organisation",
      url: "/dashboard/organizations/invitations",
      category: "Organisations",
    },
    {
      title: "Messages privés",
      description: "Messagerie privée",
      url: "/dashboard/messages",
      category: "Messagerie",
    },
    {
      title: "Groupes d'organisations",
      description: "Messagerie de groupe",
      url: "/dashboard/messages/groups",
      category: "Messagerie",
    },
    {
      title: "Mon compte",
      description: "Gérer votre profil",
      url: "/dashboard/profile",
      category: "Profil",
    },
    {
      title: "Notifications",
      description: "Voir vos notifications",
      url: "/dashboard/notifications",
      category: "Profil",
    },
    {
      title: "Paramètres",
      description: "Configuration de l'application",
      url: "/dashboard/settings",
      category: "Autres",
    },
    {
      title: "Aide & Support",
      description: "Centre d'aide et support",
      url: "/dashboard/help",
      category: "Autres",
    },
    {
      title: "Exporter les données",
      description: "Télécharger vos données",
      url: "/dashboard/export",
      category: "Autres",
    },
    {
      title: "Importer des données",
      description: "Importer depuis un fichier",
      url: "/dashboard/import",
      category: "Autres",
    },
    {
      title: "Rapports",
      description: "Générer des rapports",
      url: "/dashboard/reports",
      category: "Autres",
    },
    {
      title: "Corbeille",
      description: "Éléments supprimés",
      url: "/dashboard/trash",
      category: "Autres",
    },
  ];

  // Filtrer les éléments selon la recherche
  const filteredItems = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.category.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Grouper les résultats par catégorie
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  const handleSelect = useCallback((url: string) => {
    setOpen(false);
    setSearchValue("");
    window.location.href = url;
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  // Raccourci clavier pour ouvrir/fermer la recherche (Ctrl+K ou Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setOpen((prev) => !prev); // Bascule entre ouvert/fermé
        if (open) {
          setSearchValue(""); // Nettoyer la recherche si on ferme
        }
      }
      // Échapper pour fermer
      if (event.key === "Escape" && open) {
        setOpen(false);
        setSearchValue("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-5xl max-h-[80vh] p-0"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche globale
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Command className="h-3 w-3" />
              <span>Ctrl+K pour ouvrir/fermer</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une fonctionnalité ou une page..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucun résultat trouvé</p>
                <p className="text-sm">Essayez avec d'autres mots-clés</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <div className="text-sm font-medium text-muted-foreground mb-2 px-2">
                      {category}
                    </div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <button
                          key={item.url}
                          onClick={() => handleSelect(item.url)}
                          className="w-full text-left p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-border"
                        >
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
