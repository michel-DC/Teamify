import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Route pour traiter une invitation d'organisation via le code d'invitation
 * Si l'utilisateur est connecté : ajoute à l'organisation et marque l'invitation comme acceptée
 * Si l'utilisateur n'est pas connecté : redirige vers l'inscription avec le code d'invitation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: "Code d'invitation requis" },
        { status: 400 }
      );
    }

    // Recherche de l'invitation par le code
    const invitation = await prisma.organizationInvite.findUnique({
      where: { inviteCode: code },
      include: {
        organization: true,
        invitedBy: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée ou invalide" },
        { status: 404 }
      );
    }

    // Vérification du statut de l'invitation
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été traitée" },
        { status: 400 }
      );
    }

    // Vérification de l'authentification
    const user = await getCurrentUser();

    if (!user?.uid) {
      // Utilisateur non connecté : redirection vers l'inscription avec le code d'invitation
      const signupUrl = `/auth/register?invite=${code}`;
      return NextResponse.json({
        redirect: true,
        url: signupUrl,
        message: "Redirection vers l'inscription",
      });
    }

    // Utilisateur connecté : traitement de l'invitation
    const userUid = user.uid;

    // Vérification que l'utilisateur n'est pas déjà membre
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: invitation.organizationId,
          userUid,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Vous êtes déjà membre de cette organisation" },
        { status: 400 }
      );
    }

    // Transaction pour ajouter le membre et marquer l'invitation comme acceptée
    await prisma.$transaction([
      // Ajout du membre à l'organisation
      prisma.organizationMember.create({
        data: {
          userUid,
          organizationId: invitation.organizationId,
          role: "member",
        },
      }),
      // Mise à jour du statut de l'invitation
      prisma.organizationInvite.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
      // Mise à jour du nombre de membres de l'organisation
      prisma.organization.update({
        where: { id: invitation.organizationId },
        data: {
          memberCount: {
            increment: 1,
          },
        },
      }),
    ]);

    // Redirection vers le dashboard de l'organisation
    const dashboardUrl = `/dashboard/organizations`;

    return NextResponse.json({
      success: true,
      message: `Vous avez rejoint ${invitation.organization.name} avec succès`,
      redirect: true,
      url: dashboardUrl,
    });
  } catch (error) {
    console.error("Erreur lors du traitement de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * Route pour refuser une invitation d'organisation
 * Marque l'invitation comme refusée
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { action } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code d'invitation requis" },
        { status: 400 }
      );
    }

    if (action !== "decline") {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    // Recherche de l'invitation par le code
    const invitation = await prisma.organizationInvite.findUnique({
      where: { inviteCode: code },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée ou invalide" },
        { status: 404 }
      );
    }

    // Vérification du statut de l'invitation
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été traitée" },
        { status: 400 }
      );
    }

    // Vérification de l'authentification
    const user = await getCurrentUser();

    if (!user?.uid) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour refuser une invitation" },
        { status: 401 }
      );
    }

    // Marquer l'invitation comme refusée
    await prisma.organizationInvite.update({
      where: { id: invitation.id },
      data: { status: "DECLINED" },
    });

    return NextResponse.json({
      success: true,
      message: `Vous avez refusé l'invitation à rejoindre ${invitation.organization.name}`,
    });
  } catch (error) {
    console.error("Erreur lors du refus de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
