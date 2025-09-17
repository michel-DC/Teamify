import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Votre messagerie personnelle - Teamify",
  description: "Page de messagerie sur Teamify",
};

const MessagesLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <>{children}</>;
};

export default MessagesLayout;
