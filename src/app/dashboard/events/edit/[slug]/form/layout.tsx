import type { Metadata } from "next";

type FormLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Modifier l'événement - Teamify`,
    description: "Formulaire de modification d'un événement sur Teamify",
  };
}

export default function FormLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
