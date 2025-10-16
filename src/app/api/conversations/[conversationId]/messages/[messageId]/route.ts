import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  try {
    const { conversationId, messageId } = await params;

    console.log(
      "[conversations/messages/delete] Suppression du message:",
      messageId,
      "dans la conversation:",
      conversationId
    );

    const user = await getCurrentUser();
    if (!user) {
      console.log(
        "[conversations/messages/delete] Utilisateur non authentifié"
      );
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
        "[conversations/messages/delete] Utilisateur non membre de la conversation"
      );
      return NextResponse.json(
        { error: "Accès refusé à cette conversation" },
        { status: 403 }
      );
    }

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
        conversationId,
      },
    });

    if (!message) {
      console.log("[conversations/messages/delete] Message non trouvé");
      return NextResponse.json(
        { error: "Message non trouvé" },
        { status: 404 }
      );
    }

    if (message.senderId !== user.uid) {
      console.log(
        "[conversations/messages/delete] L'utilisateur n'est pas l'expéditeur du message"
      );
      return NextResponse.json(
        { error: "Vous ne pouvez supprimer que vos propres messages" },
        { status: 403 }
      );
    }

    await prisma.message.delete({
      where: {
        id: messageId,
      },
    });

    console.log(`[conversations/messages/delete] Message supprimé:`, messageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[conversations/messages/delete] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
