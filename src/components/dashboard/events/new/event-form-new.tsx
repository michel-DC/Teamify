"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { EventCategory, EventStatus } from "@prisma/client";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";

const eventFormSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().min(2, "L'emplacement est requis"),
  capacity: z.string().min(1, "La capacité est requise"),
  status: z.nativeEnum(EventStatus),
  budget: z.string().min(1, "Le budget est requis"),
  category: z.nativeEnum(EventCategory),
  isPublic: z.boolean().default(true),
  isCancelled: z.boolean().default(false),
  orgId: z.string().min(1, "L'organisation est requise"),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  orgId: string;
}

export function EventForm({ orgId }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      capacity: "",
      status: EventStatus.BROUILLON,
      budget: "",
      category: EventCategory.REUNION,
      isPublic: true,
      isCancelled: false,
      orgId: orgId,
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  async function onSubmit(data: EventFormValues) {
    setIsLoading(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("file", fileInput.files[0]);
      }

      const response = await fetch("/api/dashboard/events", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'événement");
      }

      toast.success("Événement créé avec succès");
      router.refresh();
      router.push("/dashboard/events");
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full max-w-2xl p-6 rounded-lg shadow-lg"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input placeholder="Titre de l'événement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Description de l'événement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début de l'évènement</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de fin de l'évènement</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emplacement</FormLabel>
                <FormControl>
                  <Input placeholder="Lieu de l'événement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacité</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Nombre de places"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Budget en €" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <FormControl>
                    <select className="w-full p-2 border rounded-md" {...field}>
                      {Object.values(EventStatus).map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="text-black"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <FormControl>
                    <select className="w-full p-2 border rounded-md" {...field}>
                      {Object.values(EventCategory).map((category) => (
                        <option
                          key={category}
                          value={category}
                          className="text-black"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormLabel>Image de l'événement</FormLabel>
          <Input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-border"
              width={128}
              height={128}
            />
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer"
          >
            {isLoading ? "Création..." : "Créer l'événement"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
