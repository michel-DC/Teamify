import { NextRequest } from "next/server";

/**
 * Handler GET pour l'API route Socket.IO
 * Note: Socket.IO ne peut pas fonctionner directement dans les API Routes Next.js
 * car elles sont stateless et ne supportent pas les connexions persistantes.
 *
 * Cette approche utilise le polling long (long polling) via des API routes
 * pour simuler un comportement similaire à Socket.IO.
 */
export async function GET(req: NextRequest) {
  return new Response("Socket.IO endpoint - Use polling approach", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin":
        "https://teamify.onlinemichel.dev, http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

/**
 * Handler POST pour l'API route Socket.IO
 */
export async function POST(req: NextRequest) {
  return new Response("Socket.IO endpoint - Use polling approach", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin":
        "https://teamify.onlinemichel.dev, http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

/**
 * Handler OPTIONS pour CORS
 */
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin":
        "https://teamify.onlinemichel.dev, http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
