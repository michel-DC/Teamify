"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewOrganizationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    memberCount: "",
    size: "PETITE",
    mission: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value);
    });

    if (file) {
      submitFormData.append("file", file);
    }

    try {
      const response = await fetch("/api/organization", {
        method: "POST",
        body: submitFormData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Organisation créée avec succès !");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Tableau de bord
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/organizations">
                  Organisations
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Créer une organisation</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Toaster position="top-center" richColors />
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Créer une nouvelle organisation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l&apos;organisation</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Description</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberCount">Nombre de membres</Label>
                  <Input
                    id="memberCount"
                    type="number"
                    value={formData.memberCount}
                    onChange={(e) =>
                      handleInputChange("memberCount", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Taille de l&apos;organisation</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => handleInputChange("size", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PETITE">
                        Petite (1-10 membres)
                      </SelectItem>
                      <SelectItem value="MOYENNE">
                        Moyenne (11-50 membres)
                      </SelectItem>
                      <SelectItem value="GRANDE">
                        Grande (50+ membres)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission">Mission de l&apos;organisation</Label>
                <Textarea
                  id="mission"
                  value={formData.mission}
                  onChange={(e) => handleInputChange("mission", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Logo de l&apos;organisation</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Création en cours..."
                  : "Créer l&apos;organisation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
