import { NextRequest } from "next/server";
import { initializeSocketIO, getSocketIO } from "@/lib/socket";

/**
 * Handler pour l'endpoint API Socket.IO
 */
export async function GET(req: NextRequest) {
  try {
    // Vérifier si Socket.IO est déjà initialisé
    let io = getSocketIO();

    if (!io) {
      // Initialiser Socket.IO
      io = initializeSocketIO();
    }

    return new Response("Socket.IO server initialized", { status: 200 });
  } catch (error) {
    console.error("[Socket.IO] Erreur d'initialisation:", error);
    return new Response("Erreur d'initialisation Socket.IO", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
