import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
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

    // Attendre params si c'est une promesse (Next.js App Router)
    const params = await context.params;
    const eventId = typeof params.id === "string" ? parseInt(params.id) : NaN;

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "ID d'événement invalide." },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        orgId: organization.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé." },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { message: "Failed to fetch event details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const eventId = parseInt(context.params.id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "ID d'événement invalide." },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true },
    });

    if (!event || event.organization?.ownerId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { message: "Failed to update event." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const eventId = parseInt(context.params.id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "ID d'événement invalide." },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true },
    });

    if (!event || event.organization?.ownerId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { message: "Failed to delete event." },
      { status: 500 }
    );
  }
}
