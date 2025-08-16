import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, firstname, passwordHash, lastname, inviteCode } =
    await req.json();
  console.log("Received data:", {
    email,
    firstname,
    lastname,
    passwordHash,
    inviteCode,
  });

  if (!email || !passwordHash) {
    return NextResponse.json(
      { error: "Email et mot de passe sont requis." },
      { status: 400 }
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(passwordHash, saltRounds);

    // Création de l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
      },
    });

    // Traitement de l'invitation si un code est fourni
    if (inviteCode) {
      try {
        // Recherche de l'invitation par le code
        const invitation = await prisma.organizationInvite.findUnique({
          where: { inviteCode },
          include: {
            organization: true,
          },
        });

        if (invitation && invitation.status === "PENDING") {
          // Vérification que l'utilisateur n'est pas déjà membre
          const existingMember = await prisma.organizationMember.findUnique({
            where: {
              organizationId_userUid: {
                organizationId: invitation.organizationId,
                userUid: newUser.uid,
              },
            },
          });

          if (!existingMember) {
            // Transaction pour ajouter le membre et marquer l'invitation comme acceptée
            await prisma.$transaction([
              // Ajout du membre à l'organisation
              prisma.organizationMember.create({
                data: {
                  userUid: newUser.uid,
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

            console.log(
              `Utilisateur ${newUser.uid} ajouté à l'organisation ${invitation.organizationId}`
            );
          }
        }
      } catch (invitationError) {
        console.error(
          "Erreur lors du traitement de l'invitation:",
          invitationError
        );
        // On ne fait pas échouer l'inscription si l'invitation échoue
      }
    }

    return NextResponse.json({
      message: "Compte créé !",
      user: newUser,
      hasInvitation: !!inviteCode,
      hasOrganization: !!inviteCode, // Si il y a une invitation, l'utilisateur aura une organisation
    });
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la création de l'utilisateur",
      error
    );
    return NextResponse.json(
      { error: "Une erreur serveur est survenue." },
      { status: 500 }
    );
  }
}
