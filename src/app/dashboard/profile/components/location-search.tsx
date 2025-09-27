"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Location {
  city: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  displayName: string;
}

// Type compatible avec UserProfile
export type UserLocation = Omit<Location, "displayName">;

interface LocationSearchProps {
  value?: UserLocation;
  onChange: (location: UserLocation | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function LocationSearch({
  value,
  onChange,
  placeholder = "Rechercher une ville...",
  disabled = false,
}: LocationSearchProps) {
  const [query, setQuery] = useState(value?.city || "");
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Recherche avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/geocoding/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const data = await response.json();
      setResults(data.results || []);
      // N'afficher les résultats que si l'input est focus
      if (document.activeElement === inputRef.current) {
        setShowResults(true);
      }
    } catch (err) {
      setError("Erreur lors de la recherche de localisation");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    const userLocation: UserLocation = {
      city: location.city,
      coordinates: location.coordinates,
    };
    onChange(userLocation);
    setQuery(location.city);
    setShowResults(false);
    setResults([]);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setResults([]);
    setShowResults(false);
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!e.target.value) {
      onChange(null);
      setShowResults(false);
    }
  };

  const handleInputFocus = () => {
    // Réafficher les résultats seulement si il y a des résultats disponibles
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Délai pour permettre la sélection d'un résultat
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  return (
    <div className="relative">
      <Label htmlFor="location">Localisation</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="location"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-20",
            value && "border-green-500 focus:border-green-500 bg-white"
          )}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          <MapPin className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Résultats de recherche */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((location, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleLocationSelect(location)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-sm">{location.city}</div>
              <div className="text-xs text-muted-foreground truncate">
                {location.displayName}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message d'erreur */}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {/* Aide */}
      {!value && !error && (
        <p className="text-xs text-muted-foreground mt-1">
          Commencez à taper pour rechercher une ville
        </p>
      )}

      {/* Affichage de la localisation sélectionnée */}
      {value && (
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {value.city}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Coordonnées: {value.coordinates.lat.toFixed(4)},{" "}
                {value.coordinates.lon.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
