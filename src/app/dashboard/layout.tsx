import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
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
        className={`${spaceGrotesk.variable} h-full bg-background text-foreground`}
      >
        <SidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
