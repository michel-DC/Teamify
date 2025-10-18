import type { Metadata } from "next";
import "../styles/globals.css";
import { DataPersistenceManager } from "@/components/data-persistence-manager";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/lenis-provider";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Teamify • Gestion d'événements en équipe",
  description:
    "Avec teamify vous pouvez gérer vos événements en équipe de manière simple et efficace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full bg-background text-foreground"
    >
      <head>
        <link rel="icon" href="/images/logo/favicon.svg" type="image/x-icon" />
      </head>
      <body className="font-quote">
        <ThemeProvider defaultTheme="light" storageKey="theme">
          <LenisProvider>
            <DataPersistenceManager />
            {children}
            <Toaster position="top-left" />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
