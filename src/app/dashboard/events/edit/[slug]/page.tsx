"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast, Toaster } from "sonner";

interface Event {
  id: number;
  publicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string;
  capacity: number;
  status: string;
  budget: number;
  category: string;
  isPublic: boolean;
  isCancelled: boolean;
  orgId: number;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    capacity: "",
    status: "PUBLIE",
    budget: "",
    category: "REUNION",
    isPublic: true,
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/dashboard/events/${params.slug}`);
        const data = await response.json();

        if (response.ok) {
          const event = data.event;
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
            capacity: event.capacity?.toString() || "",
            status: event.status || "PUBLIE",
            budget: event.budget?.toString() || "",
            category: event.category || "REUNION",
            isPublic: event.isPublic ?? true,
          });
        } else {
          toast.error(data.error || "Événement non trouvé");
          router.push("/dashboard/events");
        }
      } catch (error) {
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
      const updateData = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        location: formData.location,
        capacity: parseInt(formData.capacity),
        status: formData.status,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        category: formData.category,
        isPublic: formData.isPublic,
      };

      const response = await fetch(`/api/dashboard/events/${params.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Événement modifié avec succès !");
        router.push(`/dashboard/events/details/${params.slug}`);
      } else {
        toast.error(result.error || "Erreur lors de la modification");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <div>Chargement...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Toaster position="top-center" richColors />
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Modifier l'événement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'événement</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacité</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      handleInputChange("capacity", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (€)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange("budget", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REUNION">Réunion</SelectItem>
                      <SelectItem value="CONFERENCE">Conférence</SelectItem>
                      <SelectItem value="FORMATION">Formation</SelectItem>
                      <SelectItem value="SOCIAL">Social</SelectItem>
                      <SelectItem value="AUTRE">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BROUILLON">Brouillon</SelectItem>
                    <SelectItem value="PUBLIE">Publié</SelectItem>
                    <SelectItem value="ARCHIVE">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    handleInputChange("isPublic", checked as boolean)
                  }
                />
                <Label htmlFor="isPublic">Événement public</Label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    router.push(`/dashboard/events/details/${params.slug}`)
                  }
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Modification en cours..."
                    : "Modifier l'événement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
