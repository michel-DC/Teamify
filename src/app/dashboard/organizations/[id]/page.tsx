"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Target,
  Plus,
  Eye,
} from "lucide-react";
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
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  eventCode: string;
  isCancelled: boolean;
}

interface Organization {
  id: number;
  name: string;
  bio: string | null;
  profileImage: string | null;
  memberCount: number;
  organizationType: string;
  mission: string;
  location: {
    city: string;
    lat: number;
    lon: number;
    displayName?: string;
  } | null;
  members: any[] | null;
  createdAt: string;
  events: Event[];
}

export default function OrganizationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Récupère les détails de l'organisation
   */
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(`/api/organizations/${organizationId}`);
        if (response.ok) {
          const data = await response.json();
          setOrganization(data.organization);
        } else {
          toast.error("Organisation non trouvée");
          router.push("/dashboard/organizations");
        }
      } catch (error) {
        toast.error("Erreur lors du chargement");
        router.push("/dashboard/organizations");
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchOrganization();
    }
  }, [organizationId, router]);

  /**
   * Filtre les événements selon le terme de recherche
   */
  const filteredEvents =
    organization?.events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventCode.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ASSOCIATION":
        return "Association";
      case "PME":
        return "PME";
      case "ENTREPRISE":
        return "Entreprise";
      case "STARTUP":
        return "Startup";
      case "AUTO_ENTREPRENEUR":
        return "Auto-entrepreneur";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ASSOCIATION":
        return "bg-blue-100 text-blue-800";
      case "PME":
        return "bg-yellow-100 text-yellow-800";
      case "ENTREPRISE":
        return "bg-green-100 text-green-800";
      case "STARTUP":
        return "bg-purple-100 text-purple-800";
      case "AUTO_ENTREPRENEUR":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "BROUILLON":
        return "Brouillon";
      case "PUBLIE":
        return "Publié";
      case "TERMINE":
        return "Terminé";
      case "ANNULE":
        return "Annulé";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BROUILLON":
        return "bg-gray-100 text-gray-800";
      case "PUBLIE":
        return "bg-green-100 text-green-800";
      case "TERMINE":
        return "bg-blue-100 text-blue-800";
      case "ANNULE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Chargement de l'organisation...
          </p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

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
                <BreadcrumbPage>{organization.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Toaster position="top-center" richColors />

        {/* En-tête de l'organisation */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {organization.profileImage ? (
              <img
                src={organization.profileImage}
                alt={organization.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {organization.name}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="outline"
                  className={`${getTypeColor(
                    organization.organizationType
                  )} border-0`}
                >
                  {getTypeLabel(organization.organizationType)}
                </Badge>
                <span className="text-muted-foreground">
                  Créée le {formatDate(organization.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Informations de l'organisation */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground mt-2">{organization.bio}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Type d'organisation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {getTypeLabel(organization.organizationType)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mission</Label>
                  <p className="text-sm text-muted-foreground">
                    {organization.mission}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Localisation</Label>
                  <p className="text-sm text-muted-foreground">
                    {organization.location?.displayName || "Non spécifiée"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Nombre de membres
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {organization.memberCount} membre
                    {organization.memberCount > 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Événements
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {organization.events.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Événements organisés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mission</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {organization.mission}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description */}
        {organization.bio && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{organization.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Section des événements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Événements</h2>
            <Button
              onClick={() =>
                router.push(`/dashboard/events/new?orgId=${organization.id}`)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvel événement
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/events/details/${event.eventCode}`)
                  }
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg truncate">
                        {event.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(event.status)} border-0`}
                      >
                        {getStatusLabel(event.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        Code: {event.eventCode}
                      </div>
                      {event.isCancelled && (
                        <Badge variant="destructive" className="text-xs">
                          Annulé
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "Aucun événement trouvé" : "Aucun événement"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Essayez de modifier vos critères de recherche"
                    : "Commencez par créer votre premier événement"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() =>
                      router.push(
                        `/dashboard/events/new?orgId=${organization.id}`
                      )
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un événement
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
