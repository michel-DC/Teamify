import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify | Vos organisations",
  description: "...",
};

export default function OrganizationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
