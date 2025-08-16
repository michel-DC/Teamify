import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    let uid: string;
    let isUnique = false;

    /**
     * Génération d'un UID unique pour l'utilisateur
     * Vérification de l'unicité en base de données
     */
    do {
      uid = nanoid(12); // Génère un UID de 12 caractères

      const existingUser = await prisma.user.findUnique({
        where: { uid },
      });

      isUnique = !existingUser;
    } while (!isUnique);

    return NextResponse.json({ uid }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la génération de l'UID:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la génération de l'UID" },
      { status: 500 }
    );
  }
}
