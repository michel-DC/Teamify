import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Marque un message comme lu
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string; messageId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { conversationId, messageId } = params;

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

    // Vérifier que le message existe dans cette conversation
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour ou créer le reçu de message
    const receipt = await prisma.messageReceipt.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: user.uid,
        },
      },
      update: {
        status: "READ",
        timestamp: new Date(),
      },
      create: {
        messageId,
        userId: user.uid,
        status: "READ",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      receipt,
    });
  } catch (error) {
    console.error("[API] Erreur marquage message lu:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
