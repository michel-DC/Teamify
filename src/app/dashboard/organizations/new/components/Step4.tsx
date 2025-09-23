"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { StepProps } from "@/types/steps";
import { Button } from "@/components/ui/button";

export default function Step4({
  next,
  prev,
  formData,
  setFormData,
}: StepProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{
      city: string;
      coordinates: { lat: number; lon: number };
      displayName: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Initialisation du champ avec la ville déjà sélectionnée si elle existe
   */
  useEffect(() => {
    if (formData.location?.displayName && !query) {
      setQuery(formData.location.displayName);
    }
  }, [formData.location?.displayName, query]);

  // Debounce
  const debouncedQuery = useMemo(() => query, [query]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCities() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }
      setLoading(true);
      try {
        // Utiliser l'API de géocodage existante qui filtre déjà les résultats
        const response = await fetch(
          `/api/geocoding/search?q=${encodeURIComponent(debouncedQuery)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Filtrer uniquement les villes françaises
          const frenchCities = (data.results || []).filter((city: any) => {
            const displayName = city.displayName?.toLowerCase() || "";
            return (
              displayName.includes("france") ||
              displayName.includes("french") ||
              displayName.includes("fr,") ||
              displayName.includes(", france")
            );
          });
          setResults(frenchCities);
          setShowResults(true);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    const t = setTimeout(fetchCities, 350);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [debouncedQuery]);

  /**
   * Masquer les résultats quand on clique en dehors
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNext = () => {
    if (next) next();
  };

  const handlePrev = () => {
    if (prev) prev();
  };

  const handleSelect = (r: {
    city: string;
    coordinates: { lat: number; lon: number };
    displayName: string;
  }) => {
    setFormData({
      ...formData,
      location: {
        city: r.city,
        lat: r.coordinates.lat,
        lon: r.coordinates.lon,
        displayName: r.displayName,
      },
    });

    setQuery(r.city);
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Dans quelle ville êtes-vous situé ?
      </h2>
      <input
        ref={inputRef}
        type="text"
        className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0) {
            setShowResults(true);
          }
        }}
        placeholder="Saisissez une ville (ex: Paris)"
        aria-autocomplete="list"
        aria-controls="city-suggestions"
      />
      {loading && <p className="text-sm text-muted-foreground">Recherche...</p>}
      {showResults && results.length > 0 && (
        <div className="max-h-48 overflow-auto border border-border rounded-md divide-y bg-white dark:bg-gray-800">
          {results.map((r, idx) => (
            <button
              key={`${r.coordinates.lat}-${r.coordinates.lon}-${idx}`}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
              onClick={() => handleSelect(r)}
            >
              <div className="font-medium text-sm">{r.city}</div>
              <div className="text-xs text-muted-foreground truncate">
                {r.displayName}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between gap-4">
        <Button
          onClick={handlePrev}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Précédent
        </Button>
        <Button
          onClick={handleNext}
          disabled={!formData.location}
          className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white border border-violet-600 shadow-lg rounded-md transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
