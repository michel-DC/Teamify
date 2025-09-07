import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify - Vos événements",
  description: "...",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
