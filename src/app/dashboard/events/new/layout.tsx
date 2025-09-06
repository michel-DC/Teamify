import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify - Créer un nouvel évènement",
  description: "Page de création d'un nouvel événement sur Teamify",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
