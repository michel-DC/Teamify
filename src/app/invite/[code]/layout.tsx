import type { Metadata } from "next";
import InviteClientGate from "../client-gate";

export const metadata: Metadata = {
  title: "Rejoindre une organisation - Teamify",
  description:
    "Accédez à cette page pour rejoindre une organisation existante sur Teamify.",
};

export default function InviteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <InviteClientGate>{children}</InviteClientGate>;
}
