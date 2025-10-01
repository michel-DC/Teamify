import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Préparer votre événement • Teamify",
  description: "Page de préparation de votre événement sur Teamify",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
