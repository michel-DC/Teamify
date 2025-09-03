"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import {
  ProfileSidebar,
  ProfileSection,
  OrganizationsSection,
  SecuritySection,
  DeleteAccountSection,
} from "./components";

import { UserProfile, Organization } from "./types";

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupération des données utilisateur
  useEffect(() => {
    fetchUserProfile();
    fetchUserOrganizations();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        setUserProfile(user);
      } else {
        toast.error("Erreur lors de la récupération du profil");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      toast.error("Erreur lors de la récupération du profil");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrganizations = async () => {
    try {
      const response = await fetch("/api/user/organizations", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      } else {
        const errorData = await response.json();
        console.error("Erreur API organisations:", response.status, errorData);

        if (response.status === 401) {
          console.warn("Utilisateur non authentifié");
          // Rediriger vers la page de connexion si non authentifié
          window.location.href = "/auth/login";
        } else {
          toast.error(
            `Erreur lors de la récupération des organisations: ${
              errorData.error || "Erreur serveur"
            }`
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des organisations:", error);
      toast.error(
        "Erreur de connexion lors de la récupération des organisations"
      );
    }
  };

  const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        toast.success("Profil mis à jour avec succès 🎉");
        fetchUserProfile(); // Rafraîchir les données
      } else {
        toast.error("Erreur lors de la mise à jour du profil 💥");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Compte supprimé avec succès 🤩​");
        // Rediriger vers la page de connexion
        window.location.href = "/auth/login";
      } else {
        toast.error("Erreur lors de la suppression du compte 💥");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      toast.error("Erreur lors de la suppression du compte");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Erreur lors du chargement du profil</p>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            userProfile={userProfile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "organizations":
        return (
          <OrganizationsSection
            organizations={organizations}
            onOrganizationUpdate={fetchUserOrganizations}
          />
        );
      case "security":
        return <SecuritySection />;
      case "delete":
        return <DeleteAccountSection onDeleteAccount={handleDeleteAccount} />;
      default:
        return (
          <ProfileSection
            userProfile={userProfile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Mon profil</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <ProfileSidebar
            userProfile={userProfile}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-auto min-w-0">
          <div className="p-6">{renderActiveSection()}</div>
        </div>
      </div>
    </div>
  );
}
