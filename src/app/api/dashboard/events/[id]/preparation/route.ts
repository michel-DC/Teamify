import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function getEventAndCheckOwner(eventId: number, userId: number) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organization: true },
  });
  if (!event || event.organization?.ownerId !== userId) {
    return null;
  }
  return event;
}

// GET: Récupérer tous les groupes de tâches pour un événement
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const eventId = parseInt(params.id);
  const event = await getEventAndCheckOwner(eventId, user.id);
  if (!event)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const groups = await prisma.preparationTodoGroup.findMany({
    where: { eventId },
    include: {
      todos: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  const legacyTodos = await prisma.preparationTodo.findMany({
    where: {
      eventId,
      groupId: null,
    },
    orderBy: { createdAt: "asc" },
  });

  if (legacyTodos.length > 0 && groups.length === 0) {
    const defaultGroup = await prisma.preparationTodoGroup.create({
      data: {
        name: "Tâches générales",
        color: "#3b82f6",
        eventId,
        order: 0,
      },
    });

    await prisma.preparationTodo.updateMany({
      where: {
        eventId,
        groupId: null,
      },
      data: {
        groupId: defaultGroup.id,
        order: 0,
      },
    });

    const updatedGroups = await prisma.preparationTodoGroup.findMany({
      where: { eventId },
      include: {
        todos: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ groups: updatedGroups });
  }

  return NextResponse.json({ groups });
}

// POST: Créer un nouveau groupe ou un nouveau todo pour un événement
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const eventId = parseInt(params.id);
  const event = await getEventAndCheckOwner(eventId, user.id);
  if (!event)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { type, data } = await request.json();

  if (type === "group") {
    const { name, color } = data;
    const lastGroup = await prisma.preparationTodoGroup.findFirst({
      where: { eventId },
      orderBy: { order: "desc" },
    });
    const order = lastGroup ? lastGroup.order + 1 : 0;

    const group = await prisma.preparationTodoGroup.create({
      data: {
        name,
        color: color || "#3b82f6",
        eventId,
        order,
      },
      include: { todos: true },
    });
    return NextResponse.json({ group });
  }

  if (type === "todo") {
    const { title, groupId } = data;
    const lastTodo = await prisma.preparationTodo.findFirst({
      where: { groupId },
      orderBy: { order: "desc" },
    });
    const order = lastTodo ? lastTodo.order + 1 : 0;

    const todo = await prisma.preparationTodo.create({
      data: {
        title,
        groupId,
        eventId,
        order,
      },
    });
    await updatePreparationPercentage(eventId);
    return NextResponse.json({ todo });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}

// PATCH: Modifier l'état d'un todo ou d'un groupe
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const eventId = parseInt(params.id);
  const event = await getEventAndCheckOwner(eventId, user.id);
  if (!event)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { type, data } = await request.json();

  if (type === "todo") {
    const { todoId, done } = data;
    const todo = await prisma.preparationTodo.update({
      where: { id: todoId },
      data: { done },
    });
    await updatePreparationPercentage(eventId);
    return NextResponse.json({ todo });
  }

  if (type === "group") {
    const { groupId, name, color } = data;
    const group = await prisma.preparationTodoGroup.update({
      where: { id: groupId },
      data: { name, color },
    });
    return NextResponse.json({ group });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}

// DELETE: Supprimer un todo ou un groupe
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const eventId = parseInt(params.id);
  const event = await getEventAndCheckOwner(eventId, user.id);
  if (!event)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { type, id } = await request.json();

  if (type === "todo") {
    await prisma.preparationTodo.delete({
      where: { id },
    });
    await updatePreparationPercentage(eventId);
    return NextResponse.json({ success: true });
  }

  if (type === "group") {
    await prisma.preparationTodoGroup.delete({
      where: { id },
    });
    await updatePreparationPercentage(eventId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}

// Fonction utilitaire pour mettre à jour le pourcentage de préparation
const updatePreparationPercentage: (eventId: number) => Promise<void> = async (
  eventId
) => {
  const groups = await prisma.preparationTodoGroup.findMany({
    where: { eventId },
    include: { todos: true },
  });

  let totalTodos = 0;
  let doneTodos = 0;

  groups.forEach((group: any) => {
    totalTodos += group.todos.length;
    doneTodos += group.todos.filter((t: any) => t.done).length;
  });

  const percentage =
    totalTodos === 0 ? 0 : Math.round((doneTodos / totalTodos) * 100);

  await prisma.event.update({
    where: { id: eventId },
    data: { preparationPercentage: percentage },
  });
};
