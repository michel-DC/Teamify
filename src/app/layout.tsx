// app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css";
import { DataPersistenceManager } from "@/components/data-persistence-manager";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/lenis-provider";
import Script from "next/script";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Teamify • Gestion d'événements en équipe",
  description:
    "Avec teamify vous pouvez gérer vos événements en équipe de manière simple et efficace.",
  icons: {
    icon: "/images/logo/favicon.svg",
  },
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
      <Script 
        id="axeptio-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.axeptioSettings = {
              clientId: "69007213c605b1036fef3a54",
              cookiesVersion: "c15d1139-604d-4d52-a9b9-21ad1c76ff68",
            };
            
            (function(d, s) {
              var t = d.getElementsByTagName(s)[0], e = d.createElement(s);
              e.async = true; e.src = "//static.axept.io/sdk.js";
              t.parentNode.insertBefore(e, t);
            })(document, "script");
          `,
        }}
      />
      
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