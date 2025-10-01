import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ClientGate from "./client-gate";
import { DataPersistenceManager } from "@/components/data-persistence-manager";
import { DynamicTitleComponent } from "@/components/dynamic-title-component";

export const metadata: Metadata = {
  title: "",
  description: "Dashboard utilisateur de gestion d'organisation",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DataPersistenceManager />
      <DynamicTitleComponent />
      <AppSidebar />
      <SidebarInset className={`h-full bg-background text-foreground`}>
        {/* <SidebarTrigger /> */}
        <ClientGate>{children}</ClientGate>
      </SidebarInset>
    </SidebarProvider>
  );
}
