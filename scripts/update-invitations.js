const { PrismaClient } = require("@prisma/client");
const { randomBytes } = require("crypto");

const prisma = new PrismaClient();

/**
 * @param Génération d'un CUID simple
 *
 * Crée un identifiant unique de 20 caractères
 */
function generateCUID() {
  return randomBytes(10).toString("hex");
}

/**
 * @param Mise à jour des invitations existantes
 *
 * Ajoute des invitationId aux invitations existantes
 */
async function updateExistingInvitations() {
  try {
    console.log("🔍 Recherche des invitations sans invitationId...");

    // Récupérer toutes les invitations sans invitationId
    const invitations = await prisma.invitation.findMany({
      where: {
        invitationId: null,
      },
    });

    console.log(`📧 Trouvé ${invitations.length} invitations à mettre à jour`);

    if (invitations.length === 0) {
      console.log("✅ Aucune invitation à mettre à jour");
      return;
    }

    // Mettre à jour chaque invitation avec un invitationId
    for (const invitation of invitations) {
      const invitationId = generateCUID();

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { invitationId },
      });

      console.log(
        `✅ Invitation ${invitation.id} mise à jour avec invitationId: ${invitationId}`
      );
    }

    console.log("🎉 Toutes les invitations ont été mises à jour avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des invitations:", error);
    throw error;
  }
}

/**
 * @param Fonction principale
 *
 * Exécute la mise à jour des invitations
 */
async function main() {
  try {
    await updateExistingInvitations();
  } catch (error) {
    console.error("❌ Erreur dans le script:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
