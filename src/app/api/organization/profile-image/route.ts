import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const start = Date.now();
  try {
    // Log environnement minimal sans secrets
    console.info("[profile-image] request", {
      dbUrlPresent: Boolean(process.env.DATABASE_URL),
      dbUrlLen: process.env.DATABASE_URL?.length ?? 0,
    });

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    // Health check Prisma
    try {
      const pingStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      console.info("[profile-image] prisma health ok", {
        pingMs: Date.now() - pingStart,
      });
    } catch (err) {
      console.error("[profile-image] prisma health check failed", err);
    }

    let organization = null as { profileImage: string | null } | null;
    try {
      const qStart = Date.now();
      organization = await prisma.organization.findFirst({
        where: {
          ownerUid: user.uid,
        },
        select: {
          profileImage: true,
        },
      });
      console.info("[profile-image] findFirst done", {
        queryMs: Date.now() - qStart,
        found: Boolean(organization),
      });
    } catch (err) {
      console.error(
        "[profile-image] prisma.organization.findFirst failed",
        err
      );
      throw err;
    }

    return NextResponse.json(
      { profileImage: organization?.profileImage || null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[profile-image] error during retrieval", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'image" },
      { status: 500 }
    );
  } finally {
    console.info("[profile-image] done", { totalMs: Date.now() - start });
  }
}
