import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer une nouvelle organisation • Teamify",
  description: "...",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
