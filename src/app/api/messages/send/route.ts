import { NextRequest } from "next/server";
import { sendMessage } from "@/lib/polling-server";
import { verifyToken } from "@/lib/auth";

/**
 * API route pour envoyer un message via polling
 */
export async function POST(req: NextRequest) {
  try {
    // En développement, accepter les requêtes sans authentification
    let senderId = "dev-user";

    if (process.env.NODE_ENV === "production") {
      // Vérifier l'authentification en production
      const token = req.headers.get("authorization")?.replace("Bearer ", "");
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Token d'authentification requis" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const decoded = await verifyToken(token);
      if (!decoded) {
        return new Response(JSON.stringify({ error: "Token invalide" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      senderId = decoded.userUid;
    }

    const body = await req.json();
    const { conversationId, content, attachments } = body;

    if (!conversationId || !content) {
      return new Response(
        JSON.stringify({ error: "conversationId et content requis" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Envoyer le message
    const message = await sendMessage({
      conversationId,
      content,
      attachments,
      senderId,
    });

    return new Response(JSON.stringify(message), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":
          "https://teamify.onlinemichel.dev, http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'envoi du message",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin":
        "https://teamify.onlinemichel.dev, http://localhost:3000",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
