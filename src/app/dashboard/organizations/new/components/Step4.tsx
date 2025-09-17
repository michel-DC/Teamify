"use client";

import { useEffect, useMemo, useState } from "react";
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
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [loading, setLoading] = useState(false);

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
        return;
      }
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          debouncedQuery
        )}&accept-language=fr`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "teamify.com/1.0 ",
            Referer: "teamify-site.vercel.app",
          },
        });
        if (res.ok) {
          const data = (await res.json()) as Array<{
            display_name: string;
            lat: string;
            lon: string;
          }>;
          setResults(data);
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

  const handleNext = () => {
    if (next) next();
  };

  const handlePrev = () => {
    if (prev) prev();
  };

  const handleSelect = (r: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    setFormData({
      ...formData,
      location: {
        city: r.display_name,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        displayName: r.display_name,
      },
    });

    setQuery(r.display_name);
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Dans quelle ville êtes-vous situé ?
      </h2>
      <input
        type="text"
        className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Saisissez une ville (ex: Paris)"
        aria-autocomplete="list"
        aria-controls="city-suggestions"
      />
      {loading && <p className="text-sm text-muted-foreground">Recherche...</p>}
      {results.length > 0 && (
        <ul
          id="city-suggestions"
          className="max-h-48 overflow-auto border border-border rounded-md divide-y"
        >
          {results.map((r, idx) => (
            <li
              key={`${r.lat}-${r.lon}-${idx}`}
              role="option"
              tabIndex={0}
              className="p-2 hover:bg-accent cursor-pointer text-foreground"
              onClick={() => handleSelect(r)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSelect(r);
              }}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
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
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
