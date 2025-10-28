import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasOrganizationAccess } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const organizationId = parseInt(id);

    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: "ID d'organisation invalide" },
        { status: 400 }
      );
    }

    const hasAccess = await hasOrganizationAccess(user.uid, organizationId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Organisation non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    const membersData = (organization.members as any[]) || [];
    const members: Array<{
      id: string;
      name: string;
      email: string;
      firstname?: string;
      lastname?: string;
      uid?: string;
      role: string;
    }> = [];

    membersData.forEach((memberData: any) => {
      if (memberData.uid && memberData.firstname && memberData.lastname) {
        members.push({
          id: memberData.uid,
          name: `${memberData.firstname} ${memberData.lastname}`,
          email: memberData.email || "",
          firstname: memberData.firstname,
          lastname: memberData.lastname,
          uid: memberData.uid,
          role:
            memberData.uid === organization.ownerUid
              ? "Propriétaire"
              : "Membre",
        });
      } else if (memberData.members) {
        if (Array.isArray(memberData.members)) {
          memberData.members.forEach((memberName: string) => {
            members.push({
              id: `member_${memberName.toLowerCase().replace(/\s+/g, "_")}`,
              name: memberName,
              email: `${memberName
                .toLowerCase()
                .replace(/\s+/g, ".")}@organization.com`,
              role: "Membre",
            });
          });
        }
      } else if (memberData.owner) {
        members.push({
          id: `owner_${memberData.owner.toLowerCase().replace(/\s+/g, "_")}`,
          name: memberData.owner,
          email: `${memberData.owner
            .toLowerCase()
            .replace(/\s+/g, ".")}@organization.com`,
          role: "Propriétaire",
        });
      }
    });

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des membres" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const organizationId = parseInt(id);
    const body = await request.json();

    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: "ID d'organisation invalide" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerUid: user.uid,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    const currentMembers = (organization.members as any[]) || [];

    const newMember = {
      uid: body.uid || `member_${Date.now()}`,
      firstname: body.firstname || body.memberName || "",
      lastname: body.lastname || "",
      email:
        body.email ||
        `${body.memberName
          ?.toLowerCase()
          .replace(/\s+/g, ".")}@organization.com`,
    };

    const updatedMembers = [...currentMembers, newMember];

    const updatedOrganization = await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        members: updatedMembers,
        memberCount: updatedMembers.length,
      },
    });

    return NextResponse.json(
      {
        message: "Membre ajouté avec succès",
        organization: updatedOrganization,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'ajout du membre" },
      { status: 500 }
    );
  }
}
