"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { EventCategory } from "@prisma/client";
import { ArrowLeft, Save } from "lucide-react";
import { Calendar, MapPin } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import { CloudflareImageUpload } from "@/components/ui/cloudflare-image-upload";

/**
 * Mappage des catégories d'événements vers des labels français
 */
const categoryLabels: Record<EventCategory, string> = {
  REUNION: "Réunion",
  SEMINAIRE: "Séminaire",
  CONFERENCE: "Conférence",
  FORMATION: "Formation",
  ATELIER: "Atelier",
  NETWORKING: "Networking",
  CEREMONIE: "Cérémonie",
  EXPOSITION: "Exposition",
  CONCERT: "Concert",
  SPECTACLE: "Spectacle",
  AUTRE: "Autre",
};

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  locationCoords: {
    lat: number;
    lon: number;
    displayName: string;
  } | null;
  capacity: string;
  budget: string;
  category: EventCategory;
  isPublic: boolean;
  imageUrl: string;
}

export function EventEditForm() {
  const params = useParams();
  const router = useRouter();

  // Tous les hooks d'état doivent être déclarés en premier
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    locationCoords: null,
    capacity: "",
    budget: "",
    category: EventCategory.REUNION,
    isPublic: true,
    imageUrl: "",
  });

  /**
   * Recherche d'adresses avec l'API Nominatim
   */
  const debouncedLocationQuery = useMemo(() => locationQuery, [locationQuery]);

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
      setFormData((prev) => ({ ...prev, startDate: dateString }));

      // Si la date de fin est antérieure à la nouvelle date de début + 15 min, on la réinitialise
      if (endDate && endDate <= getMinEndDate()) {
        setEndDate(null);
        setFormData((prev) => ({ ...prev, endDate: "" }));
        setErrors((prev) => ({
          ...prev,
          endDate:
            "La date de fin doit être au moins 15 minutes après la date de début",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, startDate: "" }));
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
      setFormData((prev) => ({ ...prev, endDate: dateString }));

      if (startDate) {
        const minEndDate = new Date(startDate);
        minEndDate.setMinutes(minEndDate.getMinutes() + 15);

        if (date <= minEndDate) {
          setErrors((prev) => ({
            ...prev,
            endDate:
              "La date de fin doit être au moins 15 minutes après la date de début",
          }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, endDate: "" }));
    }
  };

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
    setFormData((prev) => ({
      ...prev,
      location: location.display_name,
      locationCoords: {
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon),
        displayName: location.display_name,
      },
    }));
    setLocationQuery(location.display_name);
    setLocationResults([]);
  };

  /**
   * Gère l'upload d'image
   */
  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/dashboard/events/${params.slug}`);
        const data = await response.json();

        if (response.ok) {
          const event = data.event;

          // Initialisation des dates pour DatePicker
          const startDateObj = event.startDate
            ? new Date(event.startDate)
            : null;
          const endDateObj = event.endDate ? new Date(event.endDate) : null;

          setStartDate(startDateObj);
          setEndDate(endDateObj);

          setFormData({
            title: event.title || "",
            description: event.description || "",
            startDate: event.startDate
              ? new Date(event.startDate).toISOString().slice(0, 16)
              : "",
            endDate: event.endDate
              ? new Date(event.endDate).toISOString().slice(0, 16)
              : "",
            location: event.location || "",
            locationCoords: event.locationCoords,
            capacity: event.capacity?.toString() || "",
            budget: event.budget?.toString() || "",
            category: event.category || EventCategory.REUNION,
            isPublic: event.isPublic ?? true,
            imageUrl: event.imageUrl || "",
          });
          setLocationQuery(event.location || "");
        } else {
          toast.error(data.error || "Événement non trouvé");
          router.push("/dashboard/events");
        }
      } catch {
        toast.error("Erreur lors du chargement de l'événement");
        router.push("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchEvent();
    }
  }, [params.slug, router]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Ajout des données du formulaire
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("startDate", formData.startDate);
      submitData.append("endDate", formData.endDate);
      submitData.append("location", formData.location);
      submitData.append("capacity", formData.capacity);
      submitData.append("budget", formData.budget);
      submitData.append("category", formData.category);
      submitData.append("isPublic", formData.isPublic.toString());

      // Ajout des coordonnées de localisation si disponibles
      if (formData.locationCoords) {
        submitData.append(
          "locationCoords",
          JSON.stringify(formData.locationCoords)
        );
      }

      // Ajout de la nouvelle image si uploadée
      if (formData.imageUrl) {
        submitData.append("imageUrl", formData.imageUrl);
      }

      const response = await fetch(`/api/dashboard/events/${params.slug}`, {
        method: "PATCH",
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Événement modifié avec succès 🤩");
        router.push(`/dashboard/events/details/${params.slug}`);
      } else {
        toast.error(result.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("[EditEvent] Erreur:", error);
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/events/edit/${params.slug}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Modifier l'événement
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {formData.title}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image de l'événement */}
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Image de l'événement
                </Label>
                <CloudflareImageUpload
                  onImageUploaded={handleImageUploaded}
                  type="event"
                  maxFileSize={5}
                  currentImageUrl={formData.imageUrl}
                />
              </div>

              {/* Informations de base */}
              <div className="space-y-4">
                <Label htmlFor="title" className="text-base font-medium">
                  Titre de l'événement *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="description" className="text-base font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="text-base"
                />
              </div>

              {/* Dates avec React DatePicker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label
                    htmlFor="startDate"
                    className="text-base font-medium flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Date de début *
                  </Label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale={fr}
                    minDate={getMinStartDate()}
                    placeholderText="Sélectionner une date et heure"
                    className="w-full h-12 px-3 py-2 border border-input rounded-md bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label
                    htmlFor="endDate"
                    className="text-base font-medium flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Date de fin *
                  </Label>
                  <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale={fr}
                    minDate={getMinEndDate()}
                    placeholderText="Sélectionner une date et heure"
                    className="w-full h-12 px-3 py-2 border border-input rounded-md bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Lieu avec API Nominatim */}
              <div className="space-y-4">
                <Label
                  htmlFor="location"
                  className="text-base font-medium flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Lieu *
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Rechercher une adresse..."
                    required
                    className="h-12 text-base"
                  />
                  {locationLoading && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Recherche...
                    </p>
                  )}
                  {locationResults.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                      {locationResults.map((result, index) => (
                        <li
                          key={`${result.lat}-${result.lon}-${index}`}
                          className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                          onClick={() => handleLocationSelect(result)}
                        >
                          {result.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Capacité et budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="capacity" className="text-base font-medium">
                    Capacité *
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      handleInputChange("capacity", e.target.value)
                    }
                    min="1"
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="budget" className="text-base font-medium">
                    Budget (€)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange("budget", e.target.value)
                    }
                    min="0"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Catégorie et visibilité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="category" className="text-base font-medium">
                    Catégorie *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value as EventCategory)
                    }
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="isPublic" className="text-base font-medium">
                    Visibilité
                  </Label>
                  <Select
                    value={formData.isPublic ? "public" : "private"}
                    onValueChange={(value) =>
                      handleInputChange("isPublic", value === "public")
                    }
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Sélectionner la visibilité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Événement public</SelectItem>
                      <SelectItem value="private">Événement privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-base"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au menu
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting
                    ? "Modification en cours..."
                    : "Modifier l'événement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
