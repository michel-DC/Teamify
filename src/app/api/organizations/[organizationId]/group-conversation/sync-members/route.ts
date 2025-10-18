import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

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
      },
    });

    let conversation = await prisma.conversation.findFirst({
      where: {
        type: "GROUP",
        organizationId: parseInt(organizationId),
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: "GROUP",
          title: "Groupe de discussion",
          organizationId: parseInt(organizationId),
        },
      });
    }

    const currentConversationMembers = await prisma.conversationMember.findMany(
      {
        where: {
          conversationId: conversation.id,
        },
      }
    );

    const currentMemberIds = currentConversationMembers.map(
      (member) => member.userId
    );
    const organizationMemberIds = organizationMembers.map(
      (member) => member.user.uid
    );

    const membersToAdd = organizationMemberIds.filter(
      (id) => !currentMemberIds.includes(id)
    );

    const membersToRemove = currentMemberIds.filter(
      (id) => !organizationMemberIds.includes(id)
    );

    if (membersToAdd.length > 0) {
      await prisma.conversationMember.createMany({
        data: membersToAdd.map((userId) => {
          const orgMember = organizationMembers.find(
            (member) => member.user.uid === userId
          );
          return {
            conversationId: conversation!.id,
            userId,
            role: orgMember?.role === "OWNER" ? "ADMIN" : "MEMBER",
          };
        }),
      });
    }

    if (membersToRemove.length > 0) {
      await prisma.conversationMember.deleteMany({
        where: {
          conversationId: conversation!.id,
          userId: {
            in: membersToRemove,
          },
        },
      });
    }

    const updatedConversation = await prisma.conversation.findUnique({
      where: {
        id: conversation!.id,
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

    const formattedConversation = {
      id: updatedConversation!.id,
      type: updatedConversation!.type,
      title: updatedConversation!.title,
      organizationId: updatedConversation!.organizationId,
      organization: updatedConversation!.organization,
      createdAt: updatedConversation!.createdAt,
      members: updatedConversation!.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      })),
      lastMessage: updatedConversation!.messages[0]
        ? {
            id: updatedConversation!.messages[0].id,
            content: updatedConversation!.messages[0].content,
            createdAt: updatedConversation!.messages[0].createdAt,
            sender: updatedConversation!.messages[0].sender,
          }
        : null,
      unreadCount: 0,
    };

    return NextResponse.json({
      conversation: formattedConversation,
      addedMembers: membersToAdd.length,
      removedMembers: membersToRemove.length,
    });
  } catch (error) {
    console.error("[API] Erreur synchronisation membres:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
