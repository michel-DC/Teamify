import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";

const sfPro = localFont({
  src: [
    {
      path: "../fonts/SF-Pro-Display-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
});

export const metadata: Metadata = {
  title: "Teamify | Gestion d'événements en équipe",
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
      className={`${sfPro.variable} h-full bg-background text-foreground`}
    >
      <head>
        <link rel="icon" href="/images/logo/favicon.png" type="image/x-icon" />
      </head>
      <body className={sfPro.className}>{children}</body>
    </html>
  );
}
