import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify | Préparation de votre événement",
  description: "Page de préparation de votre événement sur Teamify",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
