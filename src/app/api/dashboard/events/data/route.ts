import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { ownerId: user.id },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Aucune organisation trouvée pour cet utilisateur." },
        { status: 404 }
      );
    }

    const events = await prisma.event.findMany({
      where: {
        orgId: organization.id,
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching user events:", error);
    return NextResponse.json(
      { message: "Failed to fetch events." },
      { status: 500 }
    );
  }
}
