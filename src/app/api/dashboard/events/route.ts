import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasOrganizationAccess } from "@/lib/auth";
import { EventCategory, EventStatus } from "@prisma/client";
import { nanoid } from "nanoid";
import { uploadImage } from "@/lib/upload-utils";
import { writeFile } from "fs";
import { join } from "path";
import { calculateEventStatus } from "@/lib/event-status-utils";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();

  console.log("FormData received:", {
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    location: formData.get("location"),
    locationCoords: formData.get("locationCoords"),
    capacity: formData.get("capacity"),
    budget: formData.get("budget"),
    category: formData.get("category"),
    isPublic: formData.get("isPublic"),
    orgId: formData.get("orgId"),
    eventCode: formData.get("eventCode"),
    hasFile: !!formData.get("file"),
  });

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const location = formData.get("location") as string;
  const locationCoordsRaw = formData.get("locationCoords") as string | null;
  const capacity = formData.get("capacity") as string;
  const budget = formData.get("budget")
    ? parseFloat(formData.get("budget") as string)
    : null;
  const category = formData.get("category") as EventCategory;
  const isPublic = formData.get("isPublic") === "true";
  const eventCode = formData.get("eventCode") as string;
  const file = formData.get("file") as File;
  const orgId = parseInt(formData.get("orgId") as string);

  // Calcul automatique du statut basé sur les dates
  const status = calculateEventStatus(startDate, endDate);

  // Parse locationCoords si fourni
  let locationCoords: any = null;
  if (locationCoordsRaw) {
    try {
      locationCoords = JSON.parse(locationCoordsRaw);
    } catch {
      console.warn(
        "Format de coordonnées invalide, utilisation de la localisation simple"
      );
    }
  }

  console.log("Parsed values:", {
    title,
    description,
    startDate,
    endDate,
    location,
    capacity,
    status: "Calculé automatiquement: " + status,
    budget,
    category,
    isPublic,
    orgId,
    eventCode,
    hasFile: !!file,
  });

  try {
    // Vérifier que l'utilisateur a accès à l'organisation
    const hasAccess = await hasOrganizationAccess(user.uid, orgId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Organisation non trouvée ou non autorisée" },
        { status: 403 }
      );
    }

    let imageUrl: string | null = null;

    const uploadedImageUrl = formData.get("imageUrl") as string;

    if (uploadedImageUrl) {
      imageUrl = uploadedImageUrl;
    }

    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (!startDate) missingFields.push("startDate");
    if (!endDate) missingFields.push("endDate");
    if (!location) missingFields.push("location");
    if (!imageUrl) missingFields.push("imageUrl");
    if (!capacity) missingFields.push("capacity");
    if (!budget) missingFields.push("budget");
    if (!category) missingFields.push("category");
    if (!orgId || isNaN(orgId)) missingFields.push("orgId");
    if (!eventCode) missingFields.push("eventCode");

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      return NextResponse.json(
        { error: "Champs manquants", missingFields },
        { status: 400 }
      );
    }

    // Vérifie si le code d'événement existe déjà
    const existingEvent = await prisma.event.findUnique({
      where: { eventCode },
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: "Ce code d'événement existe déjà" },
        { status: 400 }
      );
    }

    const publicId = nanoid(12);

    // Crée l'événement et l'entrée EventByCode en transaction
    const event = await prisma.$transaction(async (tx) => {
      // Crée d'abord l'entrée dans EventByCode
      await tx.eventByCode.create({
        data: {
          eventCode,
          publicId,
          ownerUid: user.uid,
          title,
        },
      });

      // Puis crée l'événement
      const newEvent = await tx.event.create({
        data: {
          publicId,
          eventCode,
          ownerUid: user.uid,
          title,
          description,
          startDate,
          endDate,
          location,
          locationCoords,
          imageUrl,
          capacity: Number(capacity),
          status,
          budget,
          category,
          isPublic,
          orgId,
        },
      });

      // Incrémente le compteur d'événements de l'organisation
      await tx.organization.update({
        where: { id: orgId },
        data: {
          eventCount: {
            increment: 1,
          },
        },
      });

      return newEvent;
    });

    return NextResponse.json(
      {
        message: "Événement créé",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la création de l'événement",
      error
    );
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
