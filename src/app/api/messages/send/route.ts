import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerPusherEvent } from "@/lib/pusher";
import { verifyToken } from "@/lib/auth";

/**
 * API route pour envoyer un message
 * POST /api/messages/send
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, content, senderId } = body;

    // Validation des paramètres requis
    if (!conversationId || !content || !senderId) {
      return NextResponse.json(
        {
          error:
            "Paramètres manquants: conversationId, content, senderId requis",
        },
        { status: 400 }
      );
    }

    // Vérifier l'authentification via les cookies
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Token d'authentification requis" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { uid: senderId },
      select: {
        uid: true,
        firstname: true,
        lastname: true,
        profileImage: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la conversation existe
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                uid: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est membre de la conversation
    const isMember = conversation.members.some(
      (member) => member.user.uid === senderId
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de cette conversation" },
        { status: 403 }
      );
    }

    // Créer le message en base
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId,
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

    // Préparer les données pour Pusher
    const pusherData = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName:
        `${message.sender.firstname || ""} ${
          message.sender.lastname || ""
        }`.trim() || "Utilisateur",
      senderImage: message.sender.profileImage,
      conversationId: message.conversationId,
      timestamp: message.createdAt.toISOString(),
    };

    // Déclencher l'événement Pusher
    await triggerPusherEvent(
      `conversation-${conversationId}`,
      "new-message",
      pusherData
    );

    return NextResponse.json(
      {
        success: true,
        message: "Message envoyé avec succès",
        data: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          conversationId: message.conversationId,
          createdAt: message.createdAt,
          sender: message.sender,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erreur API send-message:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
