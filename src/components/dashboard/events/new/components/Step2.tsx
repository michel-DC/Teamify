"use client";

import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { EventFormData } from "../../../../../types/steps-event-creation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Search } from "lucide-react";

interface Step2Props {
  formData: EventFormData;
  updateFormData: (data: Partial<EventFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isStepComplete: boolean;
}

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function Step2({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isStepComplete,
}: Step2Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  // États pour la recherche d'adresse
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);

  /**
   * Calcule la date minimum pour la date de début (15 minutes après maintenant)
   */
  const getMinStartDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now;
  };

  /**
   * Calcule la date minimum pour la date de fin (15 minutes après la date de début)
   */
  const getMinEndDate = () => {
    if (!startDate) return getMinStartDate();
    const minEndDate = new Date(startDate);
    minEndDate.setMinutes(minEndDate.getMinutes() + 15);
    return minEndDate;
  };

  /**
   * Gère le changement de la date de début
   */
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setErrors((prev) => ({ ...prev, startDate: undefined }));

    if (date) {
      const dateString = date.toISOString().slice(0, 16);
      updateFormData({ startDate: dateString });

      // Si la date de fin est antérieure à la nouvelle date de début + 15 min, on la réinitialise
      if (endDate && endDate <= getMinEndDate()) {
        setEndDate(null);
        updateFormData({ endDate: "" });
        setErrors((prev) => ({
          ...prev,
          endDate:
            "La date de fin doit être au moins 15 minutes après la date de début",
        }));
      }
    } else {
      updateFormData({ startDate: "" });
    }
  };

  /**
   * Gère le changement de la date de fin
   */
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setErrors((prev) => ({ ...prev, endDate: undefined }));

    if (date) {
      const dateString = date.toISOString().slice(0, 16);
      updateFormData({ endDate: dateString });
    } else {
      updateFormData({ endDate: "" });
    }
  };

  /**
   * Recherche d'adresses avec l'API Nominatim
   */
  const debouncedLocationQuery = useMemo(() => locationQuery, [locationQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLocations() {
      if (!debouncedLocationQuery || debouncedLocationQuery.length < 3) {
        setLocationResults([]);
        return;
      }

      setLocationLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          debouncedLocationQuery
        )}&accept-language=fr`;

        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "teamify.com/1.0 (+https://teamify.com)",
            Referer: "https://teamify.com",
          },
        });

        if (res.ok) {
          const data = (await res.json()) as LocationResult[];
          setLocationResults(data);
        }
      } catch (error) {
        // Ignore les erreurs de requête annulée
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Erreur lors de la recherche d'adresse:", error);
        }
      } finally {
        setLocationLoading(false);
      }
    }

    const timeoutId = setTimeout(fetchLocations, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [debouncedLocationQuery]);

  /**
   * Gère la sélection d'une adresse
   */
  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setLocationQuery(location.display_name);
    setLocationResults([]);
    updateFormData({
      location: location.display_name,
      locationCoords: {
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon),
        displayName: location.display_name,
      },
    });
  };

  /**
   * Gère le changement manuel du champ lieu
   */
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationQuery(value);
    setSelectedLocation(null);
    updateFormData({ location: value });
  };

  /**
   * Valide les dates avant de passer à l'étape suivante
   */
  const handleNext = () => {
    const newErrors: { startDate?: string; endDate?: string } = {};

    if (!startDate) {
      newErrors.startDate = "La date de début est requise";
    } else if (startDate < getMinStartDate()) {
      newErrors.startDate =
        "La date de début doit être au moins 15 minutes après maintenant";
    }

    if (!endDate) {
      newErrors.endDate = "La date de fin est requise";
    } else if (endDate <= getMinEndDate()) {
      newErrors.endDate =
        "La date de fin doit être au moins 15 minutes après la date de début";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Effacer toutes les erreurs avant de passer à l'étape suivante
    setErrors({});
    onNext();
  };

  /**
   * Vérifie si l'étape est complète en temps réel
   */
  const isStepValid = () => {
    if (!startDate || !endDate || !formData.location) {
      return false;
    }

    // Vérifier les contraintes de temps
    if (startDate < getMinStartDate()) {
      return false;
    }

    if (endDate <= getMinEndDate()) {
      return false;
    }

    return true;
  };

  /**
   * Initialise les dates depuis formData au chargement
   */
  useEffect(() => {
    if (formData.startDate) {
      setStartDate(new Date(formData.startDate));
    }
    if (formData.endDate) {
      setEndDate(new Date(formData.endDate));
    }
    if (formData.location) {
      setLocationQuery(formData.location);
    }
  }, []);

  /**
   * Efface automatiquement les erreurs quand les dates deviennent valides
   */
  useEffect(() => {
    if (startDate && endDate && formData.location) {
      const newErrors: { startDate?: string; endDate?: string } = {};

      if (startDate < getMinStartDate()) {
        newErrors.startDate =
          "La date de début doit être au moins 15 minutes après maintenant";
      }

      if (endDate <= getMinEndDate()) {
        newErrors.endDate =
          "La date de fin doit être au moins 15 minutes après la date de début";
      }

      setErrors(newErrors);
    }
  }, [startDate, endDate, formData.location]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Dates et lieu</h2>
        <p className="text-muted-foreground">
          Définissez quand et où se déroulera votre événement
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date et heure de début *
            </Label>
            <div className="relative mt-1">
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Sélectionnez la date et l'heure de début"
                minDate={getMinStartDate()}
                className="w-full p-2 border rounded-md bg-background text-foreground"
                wrapperClassName="w-full"
                popperClassName="z-50"
                popperPlacement="bottom-start"
                customInput={
                  <Input
                    className="w-full"
                    placeholder="Sélectionnez la date et l'heure de début"
                  />
                }
              />
            </div>
            {errors.startDate && (
              <p className="text-sm text-destructive mt-1">
                {errors.startDate}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 15 minutes après maintenant
            </p>
          </div>

          <div>
            <Label htmlFor="endDate" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Date et heure de fin *
            </Label>
            <div className="relative mt-1">
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Sélectionnez la date et l'heure de fin"
                minDate={getMinEndDate()}
                disabled={!startDate}
                className="w-full p-2 border rounded-md bg-background text-foreground disabled:opacity-50"
                wrapperClassName="w-full"
                popperClassName="z-50"
                popperPlacement="bottom-start"
                customInput={
                  <Input
                    className="w-full"
                    placeholder="Sélectionnez la date et l'heure de fin"
                    disabled={!startDate}
                  />
                }
              />
            </div>
            {errors.endDate && (
              <p className="text-sm text-destructive mt-1">{errors.endDate}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 15 minutes après la date de début
            </p>
          </div>
        </div>

        <div className="relative">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Lieu de l'événement *
          </Label>
          <div className="relative mt-1">
            <Input
              id="location"
              placeholder="Ex: Salle de réunion A, 123 Rue de la Paix, Paris"
              value={locationQuery}
              onChange={handleLocationChange}
              className="w-full pr-10"
              aria-autocomplete="list"
              aria-controls="location-suggestions"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {locationLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {locationLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              Recherche d'adresses...
            </p>
          )}

          {locationResults.length > 0 && (
            <ul
              id="location-suggestions"
              className="absolute z-50 w-full max-h-48 overflow-auto border border-border rounded-md bg-background shadow-lg divide-y mt-1"
            >
              {locationResults.map((location, idx) => (
                <li
                  key={`${location.lat}-${location.lon}-${idx}`}
                  role="option"
                  tabIndex={0}
                  className="p-3 hover:bg-accent cursor-pointer text-foreground"
                  onClick={() => handleLocationSelect(location)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLocationSelect(location);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{location.display_name}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {selectedLocation && (
            <div className="text-xs text-muted-foreground mt-1">
              Adresse sélectionnée: {selectedLocation.display_name}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrev}>
          Retour
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isStepValid()}
          className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white border border-[#7C3AED] shadow-lg"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
