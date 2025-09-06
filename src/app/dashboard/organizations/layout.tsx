import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify - Vos organisations",
  description: "Page de gestion des organisations sur Teamify",
};

export default function OrganizationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
