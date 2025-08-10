"use client";

import { useState, useMemo, useEffect } from "react";
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
    organizationType: "ASSOCIATION",
    mission: "",
    location: null as {
      city: string;
      lat: number;
      lon: number;
      displayName?: string;
    } | null,
  });
  const [file, setFile] = useState<File | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const debouncedQuery = useMemo(() => query, [query]);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchCities() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoadingCities(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          debouncedQuery
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
          const data = (await res.json()) as Array<{
            display_name: string;
            lat: string;
            lon: string;
          }>;
          setResults(data);
        }
      } catch {
      } finally {
        setLoadingCities(false);
      }
    }
    const t = setTimeout(fetchCities, 350);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [debouncedQuery]);

  const handleSelectCity = (r: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        city: r.display_name,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        displayName: r.display_name,
      },
    }));
  };

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
    submitFormData.append("name", formData.name);
    submitFormData.append("bio", formData.bio);
    submitFormData.append("organizationType", formData.organizationType);
    submitFormData.append("mission", formData.mission);
    if (formData.location) {
      submitFormData.append("location", JSON.stringify(formData.location));
    }
    if (file) {
      submitFormData.append("file", file);
    }

    try {
      const response = await fetch("/api/organization/create", {
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
    <div>
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

              <div className="space-y-2">
                <Label htmlFor="orgType">Type d&apos;organisation</Label>
                <Select
                  value={formData.organizationType}
                  onValueChange={(value) =>
                    handleInputChange("organizationType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSOCIATION">Association</SelectItem>
                    <SelectItem value="PME">PME</SelectItem>
                    <SelectItem value="ENTREPRISE">Entreprise</SelectItem>
                    <SelectItem value="STARTUP">Startup</SelectItem>
                    <SelectItem value="AUTO_ENTREPRENEUR">
                      Auto-entrepreneur
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ville</Label>
                <Input
                  placeholder="Saisissez une ville (ex: Paris)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-autocomplete="list"
                  aria-controls="city-suggestions"
                />
                {loadingCities && (
                  <p className="text-sm text-muted-foreground">Recherche...</p>
                )}
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
                        onClick={() => handleSelectCity(r)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSelectCity(r)
                        }
                      >
                        {r.display_name}
                      </li>
                    ))}
                  </ul>
                )}
                {formData.location && (
                  <div className="text-sm text-muted-foreground">
                    Sélectionné: {formData.location.displayName} (
                    {formData.location.lat.toFixed(4)},{" "}
                    {formData.location.lon.toFixed(4)})
                  </div>
                )}
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
    </div>
  );
}
