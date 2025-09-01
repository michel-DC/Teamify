import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify | Gestion des invitations à vos évènements",
  description: "Page de gestion des invitations à vos évènements sur Teamify",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
