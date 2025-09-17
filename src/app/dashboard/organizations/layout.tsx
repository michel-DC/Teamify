import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gérer vos organisations - Teamify",
  description: "Page de gestion des organisations sur Teamify",
};

export default function OrganizationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
