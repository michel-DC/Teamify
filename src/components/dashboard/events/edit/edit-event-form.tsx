"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { Calendar, MapPin, Users, Euro, Tag, Eye, EyeOff } from "lucide-react";
import { EventCategory, EventStatus } from "@prisma/client";

const eventSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  budget: z.coerce.number().positive().optional(),
  isPublic: z.boolean().default(true),
  status: z.nativeEnum(EventStatus),
  category: z.nativeEnum(EventCategory),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EditEventFormProps {
  eventId: number;
}

/**
 * @param Mappage des catégories d'événements vers des labels français
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

/**
 * @param Mappage des statuts d'événements vers des labels français
 */
const statusLabels: Record<EventStatus, string> = {
  A_VENIR: "À venir",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

export default function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: EventStatus.A_VENIR,
      category: EventCategory.REUNION,
      isPublic: true,
    },
  });

  const isPublic = watch("isPublic");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/dashboard/events/${eventId}`);
        const data = await response.json();

        if (response.ok && data.event) {
          const event = data.event;
          reset({
            title: event.title || "",
            description: event.description || "",
            startDate: event.startDate
              ? new Date(event.startDate).toISOString().slice(0, 16)
              : "",
            endDate: event.endDate
              ? new Date(event.endDate).toISOString().slice(0, 16)
              : "",
            location: event.location || "",
            capacity: event.capacity || undefined,
            budget: event.budget || undefined,
            isPublic: event.isPublic ?? true,
            status: event.status || EventStatus.A_VENIR,
            category: event.category || EventCategory.REUNION,
          });
        } else {
          toast.error("Événement non trouvé ou accès refusé");
          router.push("/dashboard/events");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération:", error);
        toast.error("Erreur lors de la récupération de l'événement");
        router.push("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, reset, router]);

  /**
   * @param Soumission du formulaire de modification d'événement
   *
   * Envoie les données modifiées au backend et gère les réponses
   */
  const onSubmit = async (data: EventFormValues) => {
    try {
      const response = await fetch(`/api/dashboard/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Événement mis à jour avec succès !");
        router.push("/dashboard/events");
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "La mise à jour a échoué");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de l'événement"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <div className="text-muted-foreground">Chargement du formulaire...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Modifier l'événement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Titre de l'événement *
              </Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    id="title"
                    placeholder="Ex: Conférence sur l'innovation"
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Lieu */}
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-sm font-medium flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Lieu
              </Label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Input
                    id="location"
                    placeholder="Ex: Salle de conférence A"
                    {...field}
                  />
                )}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre événement..."
                    rows={4}
                    {...field}
                  />
                )}
              />
            </div>

            {/* Date de début */}
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Date et heure de début
              </Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Input id="startDate" type="datetime-local" {...field} />
                )}
              />
            </div>

            {/* Date de fin */}
            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Date et heure de fin
              </Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Input id="endDate" type="datetime-local" {...field} />
                )}
              />
            </div>

            {/* Capacité */}
            <div className="space-y-2">
              <Label
                htmlFor="capacity"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Capacité maximale
              </Label>
              <Controller
                name="capacity"
                control={control}
                render={({ field }) => (
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Ex: 50"
                    min="1"
                    {...field}
                  />
                )}
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">
                  {errors.capacity.message}
                </p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label
                htmlFor="budget"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Euro className="h-4 w-4" />
                Budget (€)
              </Label>
              <Controller
                name="budget"
                control={control}
                render={({ field }) => (
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1000.00"
                    min="0"
                    {...field}
                  />
                )}
              />
              {errors.budget && (
                <p className="text-sm text-destructive">
                  {errors.budget.message}
                </p>
              )}
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Tag className="h-4 w-4" />
                Catégorie *
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
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
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Statut *
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Événement public */}
            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Controller
                name="isPublic"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isPublic"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Eye className="h-4 w-4 text-primary" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Label
                  htmlFor="isPublic"
                  className="text-sm font-medium cursor-pointer"
                >
                  Événement public
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-2">
                {isPublic
                  ? "Visible par tous les utilisateurs"
                  : "Visible uniquement par les membres de l'organisation"}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/events")}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Sauvegarde..."
                  : "Sauvegarder les modifications"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
