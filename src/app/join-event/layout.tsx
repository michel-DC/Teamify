import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teamify · Rejoindre un évènement",
  description:
    "Accédez à cette page pour rejoindre un évènement existant sur Teamify.",
};

export default function JoinEventLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
