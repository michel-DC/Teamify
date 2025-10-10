import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gérer les invitations d'organisation • Teamify",
  description:
    "Page de gestion des invitations à vos organisations sur Teamify",
};

export default function OrganizationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
