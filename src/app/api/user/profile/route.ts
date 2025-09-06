import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { firstname, lastname, bio, phone, location, website, dateOfBirth } =
      body;

    // Validation des données
    if (firstname && typeof firstname !== "string") {
      return NextResponse.json(
        { error: "Le prénom doit être une chaîne de caractères" },
        { status: 400 }
      );
    }

    if (lastname && typeof lastname !== "string") {
      return NextResponse.json(
        { error: "Le nom doit être une chaîne de caractères" },
        { status: 400 }
      );
    }

    if (bio && typeof bio !== "string") {
      return NextResponse.json(
        { error: "La biographie doit être une chaîne de caractères" },
        { status: 400 }
      );
    }

    if (phone && typeof phone !== "string") {
      return NextResponse.json(
        { error: "Le téléphone doit être une chaîne de caractères" },
        { status: 400 }
      );
    }

    if (website && typeof website !== "string") {
      return NextResponse.json(
        { error: "Le site web doit être une chaîne de caractères" },
        { status: 400 }
      );
    }

    // Validation de la localisation
    if (location && typeof location === "object") {
      if (!location.city || !location.coordinates) {
        return NextResponse.json(
          {
            error: "La localisation doit contenir une ville et des coordonnées",
          },
          { status: 400 }
        );
      }

      if (
        typeof location.coordinates.lat !== "number" ||
        typeof location.coordinates.lon !== "number"
      ) {
        return NextResponse.json(
          { error: "Les coordonnées doivent être des nombres" },
          { status: 400 }
        );
      }
    }

    // Validation de la date de naissance
    let parsedDateOfBirth: Date | undefined;
    if (dateOfBirth) {
      if (typeof dateOfBirth === "string") {
        parsedDateOfBirth = new Date(dateOfBirth);
        if (isNaN(parsedDateOfBirth.getTime())) {
          return NextResponse.json(
            { error: "Format de date invalide" },
            { status: 400 }
          );
        }
      } else if (dateOfBirth instanceof Date) {
        parsedDateOfBirth = dateOfBirth;
      } else {
        return NextResponse.json(
          { error: "Format de date invalide" },
          { status: 400 }
        );
      }
    }

    // Mise à jour du profil
    const updateData = {
      firstname: firstname || undefined,
      lastname: lastname || undefined,
      bio: bio || undefined,
      phone: phone || undefined,
      location: location || undefined,
      website: website || undefined,
      dateOfBirth: parsedDateOfBirth || undefined,
    };

    const updatedUser = await prisma.user.update({
      where: { uid: currentUser.uid },
      data: updateData,
    });

    // Retourner les données mises à jour (sans le mot de passe)
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
