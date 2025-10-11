import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gérer vos événements • Teamify",
  description: "Explorez et gérez vos événements sur Teamify",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
