// app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css";
import { DataPersistenceManager } from "@/components/data-persistence-manager";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/lenis-provider";

import { Toaster } from "sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Teamify • Gestion d'événements en équipe",
  description:
    "Avec teamify vous pouvez gérer vos événements en équipe de manière simple et efficace.",
  keywords: [
    "gestion d'événements",
    "organisation d'équipe",
    "événements collaboratifs",
    "Teamify",
    "planning événementiel",
    "dashboard équipe",
    "outils collaboratifs",
    "invitation en ligne"
  ],
  authors: [{ name: "Teamify" }],
  manifest: "/manifest.json",
  themeColor: "#282846",
  icons: {
    icon: "/images/logo/favicon.svg",
    shortcut: "/images/logo/favicon.svg",
    apple: "/images/logo/favicon.svg"
  },
  openGraph: {
    title: "Teamify • Gestion d'événements en équipe",
    description:
      "Avec teamify vous pouvez gérer vos événements en équipe de manière simple et efficace.",
    url: "https://teamify.onlinemichel.dev",
    siteName: "Teamify",
    type: "website",
    images: [
      { url: "https://teamify.onlinemichel.dev/images/logo/favicon-email-dark.png", width: 512, height: 512 },
    ],
    locale: "fr_FR"
  },
  twitter: {
    card: "summary_large_image",
    title: "Teamify • Gestion d'événements en équipe",
    description:
      "Avec teamify vous pouvez gérer vos événements en équipe de manière simple et efficace.",
    site: "@teamify_app",
    images: ["https://teamify.onlinemichel.dev/images/logo/email-light.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  }
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
      <Script id="gtm-script" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
+'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P3XL2LQH');`}</Script>
      <body className="font-quote">
        <noscript dangerouslySetInnerHTML={{
          __html: `<iframe src=\"https://www.googletagmanager.com/ns.html?id=GTM-P3XL2LQH\" height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe>`
        }} />
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