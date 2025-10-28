import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    console.log(
      "[conversations/messages] Récupération des messages pour:",
      conversationId
    );

    const user = await getCurrentUser();
    if (!user) {
      console.log("[conversations/messages] Utilisateur non authentifié");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.uid,
        },
      },
    });

    if (!membership) {
      console.log(
        "[conversations/messages] Utilisateur non membre de la conversation"
      );
      return NextResponse.json(
        { error: "Accès refusé à cette conversation" },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
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
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(
      `[conversations/messages] ${messages.length} messages récupérés`
    );

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        attachments: msg.attachments,
        createdAt: msg.createdAt,
        sender: msg.sender,
      })),
    });
  } catch (error) {
    console.error("[conversations/messages] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    console.log(
      "[conversations/messages] Création d'un message pour:",
      conversationId
    );

    const body = await request.json();
    const { content, attachments } = body;

    const user = await getCurrentUser();
    if (!user) {
      console.log("[conversations/messages] Utilisateur non authentifié");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Le contenu du message est requis" },
        { status: 400 }
      );
    }

    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.uid,
        },
      },
    });

    if (!membership) {
      console.log(
        "[conversations/messages] Utilisateur non membre de la conversation"
      );
      return NextResponse.json(
        { error: "Accès refusé à cette conversation" },
        { status: 403 }
      );
    }

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

    console.log(`[conversations/messages] Message créé:`, message.id);

    return NextResponse.json({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      attachments: message.attachments,
      createdAt: message.createdAt,
      sender: message.sender,
    });
  } catch (error) {
    console.error("[conversations/messages] Erreur création:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
