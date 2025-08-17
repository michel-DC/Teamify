import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../styles/globals.css";
import { DataPersistenceManager } from "@/components/data-persistence-manager";
import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Teamify · Gestion d'événements en équipe",
  description: "Avec teamify ...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} h-full bg-background text-foreground`}
    >
      <head>
        <link rel="icon" href="/images/logo/favicon.png" type="image/x-icon" />
      </head>
      <body className={poppins.className}>
        <ThemeProvider defaultTheme="light" storageKey="theme">
          <DataPersistenceManager />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
