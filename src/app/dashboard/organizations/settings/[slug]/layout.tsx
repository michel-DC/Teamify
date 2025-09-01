import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify | Paramètres de votre organisation",
  description: "Page de paramètres de votre organisation sur Teamify",
};

export default function OrganizationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
