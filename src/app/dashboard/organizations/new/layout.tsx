import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify | Créer une nouvelle organisation",
  description: "...",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
