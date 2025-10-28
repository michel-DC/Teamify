import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Teamify • Gestion d'événements en équipe",
  description:
    "Avec teamify vous pouvez gérer vos événements en équipe de manière simple et efficace.",
};

export default function LandingLayout({
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
      <body className={`${bricolageGrotesque.variable} font-bricolage-grotesque`}>
            {children}
      </body>
    </html>
  );
}
