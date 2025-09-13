import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Récupère les conversations de l'utilisateur connecté
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    // Construire les filtres
    const whereClause: any = {
      members: {
        some: {
          userId: user.uid,
        },
      },
    };

    if (organizationId) {
      whereClause.organizationId = parseInt(organizationId);
    }

    // Récupérer les conversations avec les informations nécessaires (version simplifiée)
    const conversations = await prisma.conversation.findMany({
      where: whereClause,
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
          take: 1,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formater les données de réponse
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      type: conv.type,
      title: conv.title,
      organizationId: conv.organizationId,
      createdAt: conv.createdAt,
      members: conv.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      })),
      lastMessage: conv.messages[0]
        ? {
            id: conv.messages[0].id,
            content: conv.messages[0].content,
            createdAt: conv.messages[0].createdAt,
            sender: conv.messages[0].sender,
          }
        : null,
      unreadCount: 0, // Simplifié pour l'instant
    }));

    return NextResponse.json({
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("[API] Erreur récupération conversations:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * Crée une nouvelle conversation
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { type, title, memberIds, organizationId } = await req.json();

    if (!type || !memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: "Type et membres requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est dans la liste des membres
    if (!memberIds.includes(user.uid)) {
      memberIds.push(user.uid);
    }

    // Vérifier que tous les membres existent
    const existingUsers = await prisma.user.findMany({
      where: {
        uid: {
          in: memberIds,
        },
      },
      select: { uid: true },
    });

    if (existingUsers.length !== memberIds.length) {
      return NextResponse.json(
        { error: "Un ou plusieurs utilisateurs n'existent pas" },
        { status: 400 }
      );
    }

    // Créer la conversation avec ses membres
    const conversation = await prisma.conversation.create({
      data: {
        type,
        title: title || null,
        organizationId: organizationId ? parseInt(organizationId) : null,
        members: {
          create: memberIds.map((memberId: string) => ({
            userId: memberId,
            role: memberId === user.uid ? "ADMIN" : "MEMBER",
          })),
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
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("[API] Erreur création conversation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
