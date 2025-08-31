#!/usr/bin/env node

/**
 * Script de migration des membres d'organisation
 * Migre les données de la colonne 'members' (JSON) vers la nouvelle table 'OrganizationMember'
 *
 * EXÉCUTION : APRÈS la migration Prisma
 *
 * Usage: node scripts/migrate-organization-members.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Fonction pour parser les membres depuis différents formats
 */
function parseMembers(membersData) {
  // Si c'est déjà un tableau, on le retourne
  if (Array.isArray(membersData)) {
    return membersData;
  }

  // Si c'est une chaîne JSON
  if (typeof membersData === "string") {
    try {
      const parsed = JSON.parse(membersData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.log(`  ⚠️  Erreur de parsing JSON: ${error.message}`);
      return [];
    }
  }

  // Si c'est un objet (cas de "[object Object]")
  if (typeof membersData === "object" && membersData !== null) {
    // Si c'est un objet avec des propriétés qui ressemblent à des membres
    if (membersData.userUid || membersData.uid) {
      return [membersData];
    }

    // Si c'est un objet avec des clés qui sont des userUid
    const members = [];
    for (const [key, value] of Object.entries(membersData)) {
      if (typeof value === "object" && value !== null) {
        members.push({
          userUid: key,
          ...value,
        });
      }
    }
    return members;
  }

  return [];
}

/**
 * Migration des membres d'organisation
 */
async function migrateOrganizationMembers() {
  console.log("🚀 Début de la migration des membres d'organisation...\n");

  try {
    // Récupération de toutes les organisations avec des membres
    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        members: true,
        ownerUid: true,
      },
    });

    console.log(
      `📊 ${organizations.length} organisations trouvées avec des membres à migrer\n`
    );

    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const org of organizations) {
      console.log(
        `🏢 Traitement de l'organisation: ${org.name} (ID: ${org.id})`
      );

      try {
        // Debug: afficher le type et la valeur des membres
        console.log(`  🔍 Type des membres: ${typeof org.members}`);
        console.log(`  🔍 Valeur des membres:`, org.members);

        // Parse des membres avec la nouvelle fonction
        const members = parseMembers(org.members);

        console.log(
          `  📋 ${members.length} membres trouvés dans l'ancienne structure`
        );

        if (members.length === 0) {
          console.log(`  ⚠️  Aucun membre valide trouvé pour ${org.name}`);
          continue;
        }

        // Migration de chaque membre
        for (const member of members) {
          try {
            // Vérification que le membre a un userUid
            if (!member.userUid && !member.uid) {
              console.log(`  ⚠️  Membre sans userUid/uid ignoré:`, member);
              totalSkipped++;
              continue;
            }

            const userUid = member.userUid || member.uid;
            const role = member.role || "member";

            // Vérification si le membre existe déjà dans la nouvelle table
            const existingMember = await prisma.organizationMember.findUnique({
              where: {
                organizationId_userUid: {
                  organizationId: org.id,
                  userUid: userUid,
                },
              },
            });

            if (existingMember) {
              console.log(`  ⏭️  Membre déjà migré: ${userUid} (${role})`);
              totalSkipped++;
              continue;
            }

            // Vérification que l'utilisateur existe
            const user = await prisma.user.findUnique({
              where: { uid: userUid },
            });

            if (!user) {
              console.log(`  ⚠️  Utilisateur non trouvé: ${userUid}`);
              totalSkipped++;
              continue;
            }

            // Création du nouveau membre
            await prisma.organizationMember.create({
              data: {
                userUid: userUid,
                organizationId: org.id,
                role: role,
              },
            });

            console.log(`  ✅ Membre migré: ${userUid} (${role})`);
            totalMigrated++;
          } catch (memberError) {
            console.log(
              `  ❌ Erreur lors de la migration du membre:`,
              memberError.message
            );
            totalErrors++;
          }
        }

        // Ajout du propriétaire s'il n'est pas déjà dans les membres
        const ownerExists = await prisma.organizationMember.findUnique({
          where: {
            organizationId_userUid: {
              organizationId: org.id,
              userUid: org.ownerUid,
            },
          },
        });

        if (!ownerExists) {
          await prisma.organizationMember.create({
            data: {
              userUid: org.ownerUid,
              organizationId: org.id,
              role: "owner",
            },
          });
          console.log(`  ✅ Propriétaire ajouté: ${org.ownerUid} (owner)`);
          totalMigrated++;
        }

        console.log(`  ✅ Organisation ${org.name} traitée avec succès\n`);
      } catch (orgError) {
        console.log(
          `  ❌ Erreur lors du traitement de l'organisation ${org.name}:`,
          orgError.message
        );
        totalErrors++;
      }
    }

    // Mise à jour du nombre de membres dans les organisations
    console.log(
      "🔄 Mise à jour du nombre de membres dans les organisations..."
    );

    const allOrganizations = await prisma.organization.findMany({
      include: {
        organizationMembers: true,
      },
    });

    for (const org of allOrganizations) {
      const memberCount = org.organizationMembers.length;
      await prisma.organization.update({
        where: { id: org.id },
        data: { memberCount: memberCount },
      });
      console.log(`  📊 ${org.name}: ${memberCount} membres`);
    }

    // Résumé de la migration
    console.log("\n📈 RÉSUMÉ DE LA MIGRATION:");
    console.log(`  ✅ Membres migrés: ${totalMigrated}`);
    console.log(`  ⏭️  Membres ignorés: ${totalSkipped}`);
    console.log(`  ❌ Erreurs: ${totalErrors}`);
    console.log(`  🏢 Organisations traitées: ${organizations.length}`);

    if (totalErrors === 0) {
      console.log("\n🎉 Migration terminée avec succès !");
    } else {
      console.log(
        "\n⚠️  Migration terminée avec des erreurs. Vérifiez les logs ci-dessus."
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fonction de nettoyage (optionnelle)
 * Supprime l'ancienne colonne 'members' après vérification
 */
async function cleanupOldMembersColumn() {
  console.log("\n🧹 Nettoyage de l'ancienne colonne members...");

  try {
    // Mise à jour de toutes les organisations pour vider la colonne members
    await prisma.organization.updateMany({
      data: {
        members: null,
      },
    });

    console.log("✅ Ancienne colonne members vidée");
    console.log(
      "💡 Vous pouvez maintenant supprimer la colonne members du schéma Prisma"
    );
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
  }
}

// Exécution du script
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--cleanup")) {
    await cleanupOldMembersColumn();
  } else {
    await migrateOrganizationMembers();
  }
}

// Gestion des erreurs non capturées
process.on("unhandledRejection", (error) => {
  console.error("❌ Erreur non gérée:", error);
  process.exit(1);
});

// Exécution
main()
  .then(() => {
    console.log("\n✨ Script terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
