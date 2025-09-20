import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * API pour créer une conversation de test pour le débogage
 */
export async function POST(req: NextRequest) {
  try {
    // Authentification requise
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(
      `[test-conversation] Creating test conversation for user: ${user.uid}`
    );

    // Vérifier si une conversation de test existe déjà
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: "PRIVATE",
        title: "Test Conversation",
        members: {
          some: { userId: user.uid },
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

    if (conversation) {
      console.log(
        `[test-conversation] Test conversation already exists: ${conversation.id}`
      );
      return NextResponse.json({
        id: conversation.id,
        type: conversation.type,
        title: conversation.title,
        members: conversation.members,
      });
    }

    // Créer une conversation de test
    conversation = await prisma.conversation.create({
      data: {
        type: "PRIVATE",
        title: "Test Conversation",
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
      },
    });

    console.log(
      `[test-conversation] Test conversation created: ${conversation.id}`
    );

    return NextResponse.json({
      id: conversation.id,
      type: conversation.type,
      title: conversation.title,
      members: conversation.members,
    });
  } catch (error) {
    console.error(
      "❌ [test-conversation] Error creating test conversation:",
      error
    );
    return NextResponse.json(
      { error: "Failed to create test conversation" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Authentification requise
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Récupérer la conversation de test existante
    const conversation = await prisma.conversation.findFirst({
      where: {
        type: "PRIVATE",
        title: "Test Conversation",
        members: {
          some: { userId: user.uid },
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

    if (!conversation) {
      return NextResponse.json(
        { error: "Test conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: conversation.id,
      type: conversation.type,
      title: conversation.title,
      members: conversation.members,
    });
  } catch (error) {
    console.error(
      "❌ [test-conversation] Error fetching test conversation:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch test conversation" },
      { status: 500 }
    );
  }
}

