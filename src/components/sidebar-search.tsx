"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Composant de barre de recherche pour la sidebar
 * Permet de rechercher des fonctionnalités et pages du dashboard
 */
export function SidebarSearch() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus automatique sur l'input de recherche quand la sidebar est étendue
  useEffect(() => {
    if (!isCollapsed && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isCollapsed]);

  if (isCollapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            aria-label="Rechercher"
          >
            <Search className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Rechercher une fonctionnalité..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              {Object.entries(groupedItems).map(([category, items]) => (
                <CommandGroup key={category} heading={category}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.url}
                      value={item.title}
                      onSelect={() => handleSelect(item.url)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="px-2 py-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder="Rechercher (ou Ctrl+K)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-8 pr-8 bg-white"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {searchValue && (
        <div className="mt-2 max-h-64 overflow-y-auto">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              Aucun résultat trouvé
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <button
                        key={item.url}
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
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
      )}
    </div>
  );
}
