import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paramètres de votre organisation • Teamify",
  description: "Page de paramètres de votre organisation sur Teamify",
};

export default function OrganizationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
