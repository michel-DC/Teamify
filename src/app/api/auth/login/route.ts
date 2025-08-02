// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Champs requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Génération du token - notez la correction ici
    const token = await generateToken(user.id);

    const cookie = serialize("token", token, {
      // Pas besoin de "await token"
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    const res = NextResponse.json({
      message: "Connexion réussie",
      user: { id: user.id, email: user.email, firstname: user.firstname },
    });

    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return NextResponse.json(
      { error: "Erreur du serveur lors de la connexion" },
      { status: 500 }
    );
  }
}
