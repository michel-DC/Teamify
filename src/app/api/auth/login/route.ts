import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(req: Request) {
  const start = Date.now();
  try {
    const { email, password } = await req.json();

    console.info("[login] incoming request", {
      hasEmail: Boolean(email),
      bodyParsedMs: Date.now() - start,
      dbUrlPresent: Boolean(process.env.DATABASE_URL),
      dbUrlLen: process.env.DATABASE_URL?.length ?? 0,
    });

    if (!email || !password) {
      return NextResponse.json({ error: "Champs requis" }, { status: 400 });
    }

    try {
      const pingStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      console.info("[login] prisma health ok", {
        pingMs: Date.now() - pingStart,
      });
    } catch (err) {
      console.error("[login] prisma health check failed", err);
    }

    let user;
    try {
      const queryStart = Date.now();
      user = await prisma.user.findUnique({ where: { email } });
      console.info("[login] findUnique user done", {
        queryMs: Date.now() - queryStart,
        userFound: Boolean(user),
      });
    } catch (err) {
      console.error("[login] prisma.user.findUnique failed", err);
      throw err;
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    /**
     * Génération du token avec l'UID utilisateur
     */
    const token = await generateToken(user.uid);

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    // Calcule si l'utilisateur possède déjà une organisation
    let hasOrganization = false;
    try {
      const countStart = Date.now();
      const organizationsCount = await prisma.organization.count({
        where: { ownerUid: user.uid },
      });
      hasOrganization = organizationsCount > 0;
      console.info("[login] organization count", {
        count: organizationsCount,
        countMs: Date.now() - countStart,
      });
    } catch (err) {
      console.error("[login] prisma.organization.count failed", err);
    }

    const res = NextResponse.json({
      message: "Connexion réussie",
      user: { uid: user.uid, email: user.email, firstname: user.firstname },
      hasOrganization,
    });

    res.headers.set("Set-Cookie", cookie);
    console.info("[login] success", {
      totalMs: Date.now() - start,
      hasOrganization,
    });
    return res;
  } catch (error) {
    console.error("[login] error", error);
    return NextResponse.json(
      { error: "Erreur du serveur lors de la connexion" },
      { status: 500 }
    );
  }
}
