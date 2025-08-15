import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Génère un code d'événement unique de 8 caractères en majuscules
 */
function generateEventCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Vérifie si un code d'événement existe déjà dans la base de données
 */
async function isEventCodeUnique(code: string): Promise<boolean> {
  try {
    console.log(`🔍 Vérification de l'unicité du code: ${code}`);
    const existingEvent = await prisma.event.findUnique({
      where: { eventCode: code },
    });
    const isUnique = !existingEvent;
    console.log(`✅ Code ${code} est ${isUnique ? "unique" : "déjà utilisé"}`);
    return isUnique;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification du code ${code}:`, error);
    throw error;
  }
}

export async function GET() {
  console.log("🚀 Début de la génération de code d'événement");

  try {
    console.log("🔐 Vérification de l'authentification...");
    const user = await getCurrentUser();

    if (!user) {
      console.log("❌ Utilisateur non authentifié");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log(`✅ Utilisateur authentifié: ${user.uid}`);

    let eventCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    console.log("🔄 Début de la génération de code unique...");

    // Génère un code unique avec un maximum de tentatives
    do {
      eventCode = generateEventCode();
      attempts++;

      console.log(
        `📝 Tentative ${attempts}/${maxAttempts}: Génération du code ${eventCode}`
      );

      if (attempts > maxAttempts) {
        console.log("❌ Nombre maximum de tentatives atteint");
        return NextResponse.json(
          { error: "Impossible de générer un code unique" },
          { status: 500 }
        );
      }
    } while (!(await isEventCodeUnique(eventCode)));

    console.log(
      `🎉 Code généré avec succès: ${eventCode} (${attempts} tentatives)`
    );
    return NextResponse.json({ eventCode }, { status: 200 });
  } catch (error) {
    console.error(
      "💥 Erreur lors de la génération du code d'événement:",
      error
    );
    console.error("📋 Détails de l'erreur:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
