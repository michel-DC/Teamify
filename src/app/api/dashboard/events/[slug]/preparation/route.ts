import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasOrganizationAccess } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    /**
     * Récupère l'utilisateur actuellement authentifié
     */
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

    /**
     * Recherche l'événement correspondant au slug
     */
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
      },
    });

    // Si l'événement n'existe pas
    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur a accès à l'organisation de l'événement
     */
    const hasAccess = await hasOrganizationAccess(user.uid, event.orgId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cet événement" },
        { status: 403 }
      );
    }

    /**
     * Récupère les groupes avec leurs tâches organisées
     */
    const groups = await prisma.preparationTodoGroup.findMany({
      where: {
        eventId: event.id,
      },
      include: {
        todos: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error) {
    // Gestion des erreurs serveur lors de la récupération des tâches
    console.error(
      "Une erreur est survenue lors de la récupération des groupes",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des groupes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur a accès à l'organisation de l'événement
     */
    const hasAccess = await hasOrganizationAccess(user.uid, event.orgId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cet événement" },
        { status: 403 }
      );
    }

    if (body.type === "group") {
      const group = await prisma.preparationTodoGroup.create({
        data: {
          name: body.data.name,
          color: body.data.color,
          eventId: event.id,
          order: body.data.order || 0,
        },
      });

      return NextResponse.json({ group }, { status: 201 });
    }

    if (body.type === "todo") {
      const todo = await prisma.preparationTodo.create({
        data: {
          title: body.data.title,
          eventId: event.id,
          groupId: body.data.groupId,
          order: body.data.order || 0,
        },
      });

      return NextResponse.json({ todo }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Type d'opération non reconnu" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur lors de la création:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur a accès à l'organisation de l'événement
     */
    const hasAccess = await hasOrganizationAccess(user.uid, event.orgId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cet événement" },
        { status: 403 }
      );
    }

    if (body.type === "group") {
      const group = await prisma.preparationTodoGroup.update({
        where: {
          id: body.data.groupId,
          eventId: event.id,
        },
        data: {
          name: body.data.name,
          color: body.data.color,
        },
      });

      return NextResponse.json({ group }, { status: 200 });
    }

    if (body.type === "todo") {
      const todo = await prisma.preparationTodo.update({
        where: {
          id: body.data.todoId,
          eventId: event.id,
        },
        data: {
          done: body.data.done,
        },
      });

      // Mettre à jour le pourcentage de préparation de l'événement
      const allTodos = await prisma.preparationTodo.findMany({
        where: { eventId: event.id },
      });
      const completedTodos = allTodos.filter((todo) => todo.done).length;
      const percentage =
        allTodos.length > 0
          ? Math.round((completedTodos / allTodos.length) * 100)
          : 0;

      await prisma.event.update({
        where: { id: event.id },
        data: { preparationPercentage: percentage },
      });

      return NextResponse.json({ todo }, { status: 200 });
    }

    if (body.type === "todo_edit") {
      const todo = await prisma.preparationTodo.update({
        where: {
          id: body.data.todoId,
          eventId: event.id,
        },
        data: {
          title: body.data.title,
          description: body.data.description || null,
          assignedTo: body.data.assignedTo || null,
        },
      });

      return NextResponse.json({ todo }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Type d'opération non reconnu" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ eventCode: slug }, { publicId: slug }],
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    /**
     * Vérification que l'utilisateur a accès à l'organisation de l'événement
     */
    const hasAccess = await hasOrganizationAccess(user.uid, event.orgId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cet événement" },
        { status: 403 }
      );
    }

    if (body.type === "group") {
      await prisma.preparationTodoGroup.delete({
        where: {
          id: body.id,
          eventId: event.id,
        },
      });

      return NextResponse.json({ message: "Groupe supprimé" }, { status: 200 });
    }

    if (body.type === "todo") {
      await prisma.preparationTodo.delete({
        where: {
          id: body.id,
          eventId: event.id,
        },
      });

      // Mettre à jour le pourcentage de préparation de l'événement
      const allTodos = await prisma.preparationTodo.findMany({
        where: { eventId: event.id },
      });
      const completedTodos = allTodos.filter((todo) => todo.done).length;
      const percentage =
        allTodos.length > 0
          ? Math.round((completedTodos / allTodos.length) * 100)
          : 0;

      await prisma.event.update({
        where: { id: event.id },
        data: { preparationPercentage: percentage },
      });

      return NextResponse.json({ message: "Tâche supprimée" }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Type d'opération non reconnu" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
}
