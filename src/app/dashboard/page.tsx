"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth/authController";
import { useOrganization } from "@/hooks/useOrganization";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";

export default function Page() {
  const router = useRouter();
  const { checkAuth, logout } = useAuth();
  const { organizations, loading } = useOrganization();

  useEffect(() => {
    if (!checkAuth()) {
      toast.error(
        `Pour accéder à cette page, vous devez absolument vous connecter !`,
        {
          duration: 2500,
          onAutoClose: () => {
            router.push("/auth/login");
          },
        }
      );
    }
  }, [checkAuth, router]);

  useEffect(() => {
    if (!loading && organizations.length === 0) {
      toast.error(
        `Vous devez créer une organisation pour accéder au tableau de bord.`,
        {
          duration: 2500,
          onAutoClose: () => {
            router.push("/create-organization");
          },
        }
      );
    }
  }, [organizations, loading, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col gap-4 p-4">
          <Toaster position="top-center" richColors />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Tableau de bord</h1>
              <p className="text-muted-foreground">
                Bienvenue sur votre espace de gestion d'événements !
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
