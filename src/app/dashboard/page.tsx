"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth/authController";
import { useOrganization } from "@/hooks/useOrganization";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";

export default function Page() {
  const router = useRouter();
  const { checkAuth, logout } = useAuth();
  const { organization, loading } = useOrganization();

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
    if (!loading && !organization) {
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
  }, [organization, loading, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <main>
      <Toaster position="top-center" richColors />
      <AppSidebar />
      <p>Page d'acceuil du dashboard !</p>
    </main>
  );
}
