const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * @param Script de mise à jour des organisations existantes
 *
 * Met à jour la colonne members des organisations existantes pour inclure le propriétaire
 * avec la nouvelle structure { uid, firstname, lastname, email }
 */
async function updateExistingOrganizations() {
  try {
    console.log("Début de la mise à jour des organisations...");

    // Récupérer toutes les organisations
    const organizations = await prisma.organization.findMany({
      include: {
        owner: true,
      },
    });

    console.log(`${organizations.length} organisations trouvées`);

    for (const org of organizations) {
      console.log(`Traitement de l'organisation: ${org.name} (ID: ${org.id})`);

      // Vérifier si l'organisation a déjà des membres au nouveau format
      const currentMembers = org.members || [];
      const hasNewFormat = currentMembers.some(
        (member) =>
          member && typeof member === "object" && member.uid && member.firstname
      );

      if (!hasNewFormat) {
        // Créer le nouveau format pour le propriétaire
        const ownerMember = {
          uid: org.owner.uid,
          firstname: org.owner.firstname || "",
          lastname: org.owner.lastname || "",
          email: org.owner.email,
        };

        // Mettre à jour l'organisation avec le propriétaire dans les membres
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            members: [ownerMember],
            memberCount: 1,
          },
        });

        console.log(
          `✓ Organisation ${org.name} mise à jour avec le propriétaire`
        );
      } else {
        console.log(`- Organisation ${org.name} déjà au bon format`);
      }
    }

    console.log("Mise à jour terminée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
updateExistingOrganizations();
