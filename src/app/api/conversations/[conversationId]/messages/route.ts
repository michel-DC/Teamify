import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Récupère les messages d'une conversation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { conversationId } = params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    // Vérifier que l'utilisateur est membre de la conversation
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.uid,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Accès refusé à cette conversation" },
        { status: 403 }
      );
    }

    // Récupérer les messages avec pagination
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            uid: true,
            firstname: true,
            lastname: true,
            profileImage: true,
          },
        },
        receipts: {
          where: { userId: user.uid },
          select: {
            status: true,
            timestamp: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Compter le total de messages
    const totalMessages = await prisma.message.count({
      where: { conversationId },
    });

    return NextResponse.json({
      messages: messages.reverse(), // Inverser pour avoir l'ordre chronologique
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error) {
    console.error("[API] Erreur récupération messages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * Crée un nouveau message dans une conversation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { conversationId } = params;
    const { content, attachments } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Contenu du message requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre de la conversation
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.uid,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Accès refusé à cette conversation" },
        { status: 403 }
      );
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.uid,
        content: content.trim(),
        attachments: attachments || null,
      },
      include: {
        sender: {
          select: {
            uid: true,
            firstname: true,
            lastname: true,
            profileImage: true,
          },
        },
      },
    });

    // Récupérer tous les membres de la conversation
    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    // Créer les reçus de message pour chaque membre
    await Promise.all(
      members.map((member) =>
        prisma.messageReceipt.create({
          data: {
            messageId: message.id,
            userId: member.userId,
            status: member.userId === user.uid ? "READ" : "DELIVERED",
          },
        })
      )
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[API] Erreur création message:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
