import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: "PRIVATE",
        members: {
          every: {
            userId: {
              in: [user.uid, userId],
            },
          },
        },
      },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    const hasBothUsers =
      existingConversation?.members.some(
        (member: any) => member.userId === user.uid
      ) &&
      existingConversation?.members.some(
        (member: any) => member.userId === userId
      ) &&
      existingConversation?._count.members === 2;

    return NextResponse.json({
      exists: !!existingConversation && hasBothUsers,
    });
  } catch (error) {
    console.error("[API] Erreur vérification conversation privée:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
