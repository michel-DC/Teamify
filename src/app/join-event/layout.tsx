import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify - Rejoindre un événement",
  description:
    "Accédez à cette page pour rejoindre un événement existant sur Teamify.",
};

export default function JoinEventLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
