"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SettingsSidebar } from "./components/sidebar-settings";
import { GeneralSettings } from "./components/general-settings";
import { MembersSettings } from "./components/members-settings";
import { PermissionsSettings } from "./components/permissions-settings";
import { useOrganizationPermissions } from "@/hooks/useOrganization";
import { ArrowLeft, Building2 } from "lucide-react";

interface Organization {
  id: number;
  publicId: string;
  name: string;
  bio: string | null;
  organizationType: string;
  mission: string;
  profileImage: string | null;
  memberCount: number;
  eventCount: number;
}

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const publicId = params.slug as string;

  const [activeSection, setActiveSection] = useState("general");
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    userRole,
    loading: roleLoading,
    fetchUserRole,
  } = useOrganizationPermissions();

  /**
   * Récupération des données de l'organisation et du rôle utilisateur
   */
  useEffect(() => {
    if (publicId) {
      fetchOrganization();
      fetchUserRole(publicId);
    }
  }, [publicId]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(
        `/api/organizations/by-public-id/${publicId}`
      );
      if (response.ok) {
        const data = await response.json();
        setOrganization(data.organization);
      } else {
        toast.error("Organisation non trouvée");
        router.push("/dashboard/organizations");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'organisation:", error);
      toast.error("Erreur lors de la récupération de l'organisation");
      router.push("/dashboard/organizations");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérification des permissions d'accès
   */
  useEffect(() => {
    if (!roleLoading && userRole && !["OWNER", "ADMIN"].includes(userRole)) {
      toast.error(
        "Vous n'avez pas les permissions pour accéder aux paramètres"
      );
      router.push("/dashboard/organizations");
    }
  }, [userRole, roleLoading, router]);

  /**
   * Gestion du changement de section
   */
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  /**
   * Callback pour rafraîchir les données de l'organisation
   */
  const handleOrganizationUpdate = () => {
    fetchOrganization();
  };

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Organisation non trouvée</h3>
          <p className="text-muted-foreground mb-4">
            L'organisation que vous recherchez n'existe pas ou vous n'y avez pas
            accès.
          </p>
          <Button onClick={() => router.push("/dashboard/organizations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux organisations
          </Button>
        </div>
      </div>
    );
  }

  if (!["OWNER", "ADMIN"].includes(userRole || "")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Accès refusé</h3>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder aux
            paramètres de cette organisation.
          </p>
          <Button onClick={() => router.push("/dashboard/organizations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux organisations
          </Button>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <GeneralSettings
            organization={organization}
            userRole={userRole}
            onOrganizationUpdate={handleOrganizationUpdate}
          />
        );
      case "members":
        return (
          <MembersSettings
            organizationId={organization.id}
            organizationPublicId={organization.publicId}
            userRole={userRole}
          />
        );
      case "permissions":
        return (
          <PermissionsSettings
            organizationId={organization.id}
            organizationPublicId={organization.publicId}
            userRole={userRole}
          />
        );
      default:
        return (
          <GeneralSettings
            organization={organization}
            userRole={userRole}
            onOrganizationUpdate={handleOrganizationUpdate}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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
                <BreadcrumbPage>Paramètres</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            userRole={userRole}
          />
        </div>

        {/* Contenu de la section */}
        <div className="flex-1 overflow-auto min-w-0">
          <div className="p-6">
            {/* En-tête de la section */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                Paramètres de{" "}
                <span className="text-[#7C3AED]">{organization.name}</span>
              </h1>
              <p className="text-muted-foreground">
                Gérez les paramètres et les autorisations de votre organisation.
              </p>
            </div>

            {/* Contenu de la section active */}
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
