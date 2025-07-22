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
import { toast } from "sonner";

const eventSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  budget: z.coerce.number().positive().optional(),
  isPublic: z.boolean().default(true),
  status: z.enum(["BROUILLON", "PUBLIE", "TERMINE", "ANNULE"]),
  category: z.enum([
    "REUNION",
    "SEMINAIRE",
    "CONFERENCE",
    "FORMATION",
    "ATELIER",
    "NETWORKING",
    "CEREMONIE",
    "EXPOSITION",
    "CONCERT",
    "SPECTACLE",
    "AUTRE",
  ]),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EditEventFormProps {
  eventId: number;
}

export default function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/dashboard/events/${eventId}`);
        const data = await response.json();
        if (data.event) {
          const event = data.event;
          reset({
            ...event,
            startDate: event.startDate
              ? new Date(event.startDate).toISOString().slice(0, 16)
              : "",
            endDate: event.endDate
              ? new Date(event.endDate).toISOString().slice(0, 16)
              : "",
          });
        }
      } catch (error) {
        toast.error("Erreur lors de la récupération de l'événement.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, reset]);

  const onSubmit = async (data: EventFormValues) => {
    try {
      const response = await fetch(`/api/dashboard/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("La mise à jour a échoué");
      }

      toast.success("Événement mis à jour avec succès!");
      router.push("/dashboard/events");
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'événement.");
    }
  };

  if (loading) {
    return <div>Chargement du formulaire...</div>;
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Modifier l'événement</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => <Input id="title" {...field} />}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => <Input id="location" {...field} />}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Textarea id="description" {...field} />}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début</Label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Input id="startDate" type="datetime-local" {...field} />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Date de fin</Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Input id="endDate" type="datetime-local" {...field} />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacité</Label>
            <Controller
              name="capacity"
              control={control}
              render={({ field }) => (
                <Input id="capacity" type="number" {...field} />
              )}
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm">{errors.capacity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (€)</Label>
            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <Input id="budget" type="number" step="0.01" {...field} />
              )}
            />
            {errors.budget && (
              <p className="text-red-500 text-sm">{errors.budget.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(eventSchema.shape.category.Values).map(
                      (cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(eventSchema.shape.status.Values).map(
                      (stat) => (
                        <SelectItem key={stat} value={stat}>
                          {stat}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center gap-2">
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
            <Label htmlFor="isPublic">Événement public</Label>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
