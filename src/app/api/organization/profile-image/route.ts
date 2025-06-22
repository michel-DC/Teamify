import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // ou ta config Prisma

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const organization = await prisma.organization.findUnique({
    where: {
      ownerId: user.id,
    },
    select: {
      profileImage: true,
    },
  });

  if (!organization) {
    return NextResponse.json(
      { error: "Aucune organisation trouvée" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    profileImage: organization.profileImage || null,
  });
}
