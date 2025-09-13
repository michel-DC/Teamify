import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * API de démonstration pour les conversations (SÉCURISÉE)
 */
export async function GET(req: NextRequest) {
  try {
    console.log("[API] Démo conversations - Début");

    // Vérification de l'authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    console.log(`[API] Démo pour l'utilisateur: ${user.email}`);

    // Créer une conversation de démonstration personnalisée pour l'utilisateur
    const demoTitle = `Conversation de démonstration - ${
      user.firstname || user.email
    }`;

    let demoConversation = await prisma.conversation.findFirst({
      where: {
        title: demoTitle,
        members: {
          some: {
            userId: user.uid,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                uid: true,
                firstname: true,
                lastname: true,
                profileImage: true,
              },
            },
          },
        },
        messages: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });

    // Si pas de conversation de démo pour cet utilisateur, en créer une
    if (!demoConversation) {
      console.log(
        `[API] Création d'une conversation de démonstration pour ${user.email}`
      );

      demoConversation = await prisma.conversation.create({
        data: {
          type: "GROUP",
          title: demoTitle,
          members: {
            create: {
              userId: user.uid,
              role: "ADMIN",
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  uid: true,
                  firstname: true,
                  lastname: true,
                  profileImage: true,
                },
              },
            },
          },
          messages: {
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              sender: {
                select: {
                  firstname: true,
                  lastname: true,
                },
              },
            },
          },
        },
      });

      // Ajouter quelques messages de démonstration
      await prisma.message.createMany({
        data: [
          {
            conversationId: demoConversation.id,
            senderId: user.uid,
            content: `Bienvenue ${
              user.firstname || "dans"
            } la conversation de démonstration !`,
          },
          {
            conversationId: demoConversation.id,
            senderId: user.uid,
            content: "Ceci est un test du système de messagerie Socket.IO.",
          },
          {
            conversationId: demoConversation.id,
            senderId: user.uid,
            content: "Les messages en temps réel fonctionnent parfaitement !",
          },
        ],
      });

      // Récupérer la conversation avec les nouveaux messages
      demoConversation = await prisma.conversation.findUnique({
        where: { id: demoConversation.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  uid: true,
                  firstname: true,
                  lastname: true,
                  profileImage: true,
                },
              },
            },
          },
          messages: {
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              sender: {
                select: {
                  firstname: true,
                  lastname: true,
                },
              },
            },
          },
        },
      });
    }

    // Formater la réponse
    const formattedConversation = {
      id: demoConversation!.id,
      type: demoConversation!.type,
      title: demoConversation!.title,
      organizationId: demoConversation!.organizationId,
      createdAt: demoConversation!.createdAt,
      members: demoConversation!.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      })),
      lastMessage: demoConversation!.messages[0]
        ? {
            id: demoConversation!.messages[0].id,
            content: demoConversation!.messages[0].content,
            createdAt: demoConversation!.messages[0].createdAt,
            sender: demoConversation!.messages[0].sender,
          }
        : null,
      unreadCount: 0,
      messages: demoConversation!.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        sender: msg.sender,
      })),
    };

    console.log(
      `[API] Conversation de démo récupérée pour ${user.email}: ${formattedConversation.id}`
    );

    return NextResponse.json({
      success: true,
      conversations: [formattedConversation],
      message: "Conversation de démonstration créée/récupérée avec succès",
    });
  } catch (error) {
    console.error("[API] Erreur démo conversations:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
