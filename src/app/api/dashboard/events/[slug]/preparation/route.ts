import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Récupère l'utilisateur actuellement authentifié
    const user = await getCurrentUser();

    // Vérifie si l'utilisateur est authentifié
    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    // Récupère les paramètres
    const { slug } = await params;

    // Recherche l'événement correspondant au slug et appartenant à l'utilisateur
    const event = await prisma.event.findFirst({
      where: {
        publicId: slug,
        ownerId: user.id,
      },
    });

    // Si l'événement n'existe pas ou n'appartient pas à l'utilisateur
    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupère la liste des tâches de préparation associées à l'événement
    const todos = await prisma.preparationTodo.findMany({
      where: {
        eventId: event.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ todos }, { status: 200 });
  } catch (error) {
    // Gestion des erreurs serveur lors de la récupération des tâches
    console.error(
      "Une erreur est survenue lors de la récupération des tâches",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des tâches" },
      { status: 500 }
    );
  }
}
