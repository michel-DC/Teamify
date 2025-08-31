import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrganizationRoleByPublicId } from "@/lib/auth";

/**
 * @param Route pour récupérer le rôle d'un utilisateur dans une organisation
 *
 * Retourne le rôle de l'utilisateur connecté dans l'organisation spécifiée par publicId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const organizationPublicId = publicId;

    if (!organizationPublicId) {
      return NextResponse.json(
        { error: "Public ID d'organisation requis" },
        { status: 400 }
      );
    }

    // Vérification de l'authentification
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupération du rôle de l'utilisateur dans l'organisation par publicId
    const role = await getUserOrganizationRoleByPublicId(
      user.uid,
      organizationPublicId
    );

    if (!role) {
      return NextResponse.json(
        { error: "Utilisateur non membre de cette organisation" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      role,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
