import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Récupère ou crée la conversation de groupe pour une organisation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est membre de l'organisation
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: parseInt(organizationId),
          userUid: user.uid,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de cette organisation" },
        { status: 403 }
      );
    }

    // Chercher une conversation de groupe existante pour cette organisation
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: "GROUP",
        organizationId: parseInt(organizationId),
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
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
    });

    // Si aucune conversation de groupe n'existe, en créer une
    if (!conversation) {
      // Récupérer tous les membres de l'organisation
      const organizationMembers = await prisma.organizationMember.findMany({
        where: {
          organizationId: parseInt(organizationId),
        },
        include: {
          user: {
            select: {
              uid: true,
              firstname: true,
              lastname: true,
              profileImage: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
      });

      const memberIds = organizationMembers.map((member) => member.user.uid);

      // Créer la conversation de groupe
      conversation = await prisma.conversation.create({
        data: {
          type: "GROUP",
          title: `Groupe ${organizationMembers[0].organization.name} `,
          organizationId: parseInt(organizationId),
          members: {
            create: organizationMembers.map((member) => ({
              userId: member.user.uid,
              role: member.role === "OWNER" ? "ADMIN" : "MEMBER",
            })),
          },
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
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
      });
    }

    // Formater la réponse
    const formattedConversation = {
      id: conversation.id,
      type: conversation.type,
      title: conversation.title,
      organizationId: conversation.organizationId,
      organization: conversation.organization,
      createdAt: conversation.createdAt,
      members: conversation.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      })),
      lastMessage: conversation.messages[0]
        ? {
            id: conversation.messages[0].id,
            content: conversation.messages[0].content,
            createdAt: conversation.messages[0].createdAt,
            sender: conversation.messages[0].sender,
          }
        : null,
      unreadCount: 0, // Simplifié pour l'instant
    };

    return NextResponse.json({
      conversation: formattedConversation,
    });
  } catch (error) {
    console.error("[API] Erreur récupération conversation de groupe:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * Met à jour la conversation de groupe (titre, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;
    const user = await getCurrentUser();
    const { title } = await req.json();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est membre de l'organisation
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: parseInt(organizationId),
          userUid: user.uid,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de cette organisation" },
        { status: 403 }
      );
    }

    // Trouver la conversation de groupe
    const conversation = await prisma.conversation.findFirst({
      where: {
        type: "GROUP",
        organizationId: parseInt(organizationId),
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation de groupe non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la conversation
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        title: title || "Groupe de discussion",
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

    return NextResponse.json({
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("[API] Erreur mise à jour conversation de groupe:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
