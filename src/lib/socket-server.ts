import { Server as NetServer } from "http";
import { initializeSocketIO } from "./socket";

/**
 * Initialise Socket.IO avec le serveur HTTP de Next.js
 * Cette fonction doit être appelée au démarrage du serveur
 */
export function setupSocketIOServer(httpServer: NetServer) {
  try {
    const io = initializeSocketIO(httpServer);
    return io;
  } catch (error) {
    console.error("❌ Failed to initialize Socket.IO server:", error);
    throw error;
  }
}
