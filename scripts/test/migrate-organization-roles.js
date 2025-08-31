const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * @param Script de migration des rôles d'organisation
 *
 * Met à jour les anciennes entrées de la table OrganizationMember pour utiliser
 * le nouveau système de rôles avec l'enum OrganizationRole
 */
async function migrateOrganizationRoles() {
  console.log("🚀 Début de la migration des rôles d'organisation...");

  try {
    // Récupérer toutes les entrées de OrganizationMember
    const members = await prisma.organizationMember.findMany({
      include: {
        organization: true,
      },
    });

    console.log(`📊 ${members.length} membres trouvés à migrer`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const member of members) {
      try {
        // Vérifier si le membre est le propriétaire de l'organisation
        const isOwner = member.organization.ownerUid === member.userUid;

        // Déterminer le nouveau rôle
        let newRole;
        if (isOwner) {
          newRole = "OWNER";
        } else if (member.role === "admin" || member.role === "ADMIN") {
          newRole = "ADMIN";
        } else {
          newRole = "MEMBER";
        }

        // Mettre à jour le rôle si nécessaire
        if (member.role !== newRole) {
          await prisma.organizationMember.update({
            where: {
              id: member.id,
            },
            data: {
              role: newRole,
            },
          });

          console.log(
            `✅ Membre ${member.userUid} dans l'organisation ${member.organizationId}: ${member.role} → ${newRole}`
          );
          updatedCount++;
        } else {
          console.log(
            `⏭️  Membre ${member.userUid} dans l'organisation ${member.organizationId}: rôle déjà correct (${member.role})`
          );
          skippedCount++;
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors de la migration du membre ${member.userUid}:`,
          error
        );
      }
    }

    console.log("\n📈 Résumé de la migration:");
    console.log(`   - Membres mis à jour: ${updatedCount}`);
    console.log(`   - Membres ignorés (déjà corrects): ${skippedCount}`);
    console.log(`   - Total traité: ${members.length}`);

    // Vérifier qu'il n'y a pas d'organisations sans propriétaire
    const organizationsWithoutOwner = await prisma.organization.findMany({
      where: {
        organizationMembers: {
          none: {
            role: "OWNER",
          },
        },
      },
    });

    if (organizationsWithoutOwner.length > 0) {
      console.log("\n⚠️  ATTENTION: Organisations sans propriétaire trouvées:");
      organizationsWithoutOwner.forEach((org) => {
        console.log(`   - Organisation ID ${org.id}: ${org.name}`);
      });
    } else {
      console.log("\n✅ Toutes les organisations ont un propriétaire");
    }

    console.log("\n🎉 Migration terminée avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateOrganizationRoles()
  .then(() => {
    console.log("✅ Script terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
