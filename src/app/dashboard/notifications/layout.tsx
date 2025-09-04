import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify · Vos notifications",
  description: "Page de gestion des notifications sur Teamify",
};

export default function NotificationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
