import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { WelcomeEmailService } from "../../../../../emails/services/welcome.service";
import { createNotificationForOrganizationOwnersAndAdmins } from "@/lib/notification-service";

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

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
      },
    });

    if (inviteCode) {
      try {
        const invitation = await prisma.organizationInvite.findUnique({
          where: { inviteCode },
          include: {
            organization: true,
          },
        });

        if (invitation && invitation.status === "PENDING") {
          const existingMember = await prisma.organizationMember.findUnique({
            where: {
              organizationId_userUid: {
                organizationId: invitation.organizationId,
                userUid: newUser.uid,
              },
            },
          });

          if (!existingMember) {
            await prisma.$transaction([
              prisma.organizationMember.create({
                data: {
                  userUid: newUser.uid,
                  organizationId: invitation.organizationId,
                  role: "MEMBER",
                },
              }),
              prisma.organizationInvite.update({
                where: { id: invitation.id },
                data: { status: "ACCEPTED" },
              }),
              prisma.organization.update({
                where: { id: invitation.organizationId },
                data: {
                  memberCount: {
                    increment: 1,
                  },
                },
              }),
            ]);

            try {
              await createNotificationForOrganizationOwnersAndAdmins(
                invitation.organizationId,
                {
                  notificationName: "Nouveau membre rejoint l'organisation",
                  notificationDescription: `${
                    newUser.firstname || newUser.email
                  } a rejoint l'organisation "${
                    invitation.organization.name
                  }" via une invitation.`,
                  notificationType: "INFO",
                }
              );

              console.log(
                `Notifications créées pour les OWNER/ADMIN de l'organisation ${invitation.organizationId} - nouveau membre via inscription: ${newUser.uid}`
              );
            } catch (notificationError) {
              console.error(
                "Erreur lors de la création des notifications pour les OWNER/ADMIN:",
                notificationError
              );
            }

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
      }
    }

    try {
      const hasOrganization = !!inviteCode;
      let organizationName: string | undefined;
      let organizationPublicId: string | undefined;

      if (hasOrganization) {
        const userOrganizations = await prisma.organizationMember.findMany({
          where: { userUid: newUser.uid },
          include: { organization: true },
        });

        if (userOrganizations.length > 0) {
          const firstOrg = userOrganizations[0].organization;
          organizationName = firstOrg.name;
          organizationPublicId = firstOrg.publicId || undefined;
        }
      }

      const welcomeData = {
        userName:
          `${firstname || ""} ${lastname || ""}`.trim() || "Utilisateur",
        hasOrganization,
        organizationName,
        organizationPublicId,
      };

      const recipientName =
        `${firstname || ""} ${lastname || ""}`.trim() || "Utilisateur";

      WelcomeEmailService.sendWelcomeEmailAsync(
        newUser.email,
        recipientName,
        welcomeData
      );
    } catch (welcomeEmailError) {
      console.error(
        "Erreur lors de l'envoi de l'email de bienvenue:",
        welcomeEmailError
      );
    }

    return NextResponse.json({
      message: "Compte créé !",
      user: newUser,
      hasInvitation: !!inviteCode,
      hasOrganization: !!inviteCode,
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
