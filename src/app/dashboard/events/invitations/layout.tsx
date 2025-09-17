import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gérer les invitations - Teamify",
  description: "Page de gestion des invitations à vos événements sur Teamify",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
