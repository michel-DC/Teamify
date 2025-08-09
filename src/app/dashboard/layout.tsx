import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  SidebarProvider,
  // SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ClientGate from "./ClientGate";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Teamify | Dashboard",
  description: "Dashboard utilisateur de gestion d'organisation",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        className={`${poppins.variable} h-full bg-background text-foreground`}
      >
        {/* <SidebarTrigger /> */}
        <ClientGate>{children}</ClientGate>
      </SidebarInset>
    </SidebarProvider>
  );
}
