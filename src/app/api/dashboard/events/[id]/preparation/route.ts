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

// GET: Récupérer tous les todos de préparation pour un événement
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
  const todos = await prisma.preparationTodo.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ todos });
}

// POST: Créer un nouveau todo pour un événement
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
  const { title } = await request.json();
  const todo = await prisma.preparationTodo.create({
    data: { title, eventId },
  });
  await updatePreparationPercentage(eventId);
  return NextResponse.json({ todo });
}

// PATCH: Modifier l'état d'un todo (coché/décoché)
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
  const { todoId, done } = await request.json();
  const todo = await prisma.preparationTodo.update({
    where: { id: todoId },
    data: { done },
  });
  await updatePreparationPercentage(eventId);
  return NextResponse.json({ todo });
}

// DELETE: Supprimer un todo
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
  const { todoId } = await request.json();
  await prisma.preparationTodo.delete({
    where: { id: todoId },
  });
  await updatePreparationPercentage(eventId);
  return NextResponse.json({ success: true });
}

// Fonction utilitaire pour mettre à jour le pourcentage de préparation
type UpdatePreparationPercentage = (eventId: number) => Promise<void>;
const updatePreparationPercentage: UpdatePreparationPercentage = async (
  eventId
) => {
  const todos = await prisma.preparationTodo.findMany({ where: { eventId } });
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
  await prisma.event.update({
    where: { id: eventId },
    data: { preparationPercentage: percentage },
  });
};
