import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify - Mon profil",
  description: "Accédez à cette page pour voir mon profil sur Teamify.",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
