import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un nouvel événement • Teamify",
  description: "Page de création d'un nouvel événement sur Teamify",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
