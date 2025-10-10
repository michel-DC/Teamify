import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

type EventsLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const eventName = await getEventNameBySlug(slug);

  return {
    title: `Modifier l'événement${
      eventName
        ? ` : ${eventName.charAt(0).toLowerCase() + eventName.slice(1)}`
        : ""
    } • Teamify`,
    description: "Page de modification d'un événement sur Teamify",
  };
}

async function getEventNameBySlug(slug: string): Promise<string | null> {
  try {
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
      },
      select: {
        title: true,
      },
    });

    return event?.title || null;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du nom de l'événement:",
      error
    );
    return null;
  }
}

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
