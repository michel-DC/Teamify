import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API de test simple pour les conversations
 */
export async function GET(req: NextRequest) {
  try {
    console.log("[API] Test conversations - Début");

    // Test simple de connexion à la base
    const userCount = await prisma.user.count();
    console.log(`[API] Nombre d'utilisateurs: ${userCount}`);

    // Test simple des conversations
    const conversationCount = await prisma.conversation.count();
    console.log(`[API] Nombre de conversations: ${conversationCount}`);

    // Récupérer toutes les conversations (sans filtres complexes)
    const conversations = await prisma.conversation.findMany({
      take: 10, // Limiter à 10 pour le test
      include: {
        members: {
          take: 2, // Limiter les membres
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
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`[API] Conversations récupérées: ${conversations.length}`);

    return NextResponse.json({
      success: true,
      userCount,
      conversationCount,
      conversations: conversations.map((conv) => ({
        id: conv.id,
        type: conv.type,
        title: conv.title,
        memberCount: conv.members.length,
        createdAt: conv.createdAt,
      })),
    });
  } catch (error) {
    console.error("[API] Erreur test conversations:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
