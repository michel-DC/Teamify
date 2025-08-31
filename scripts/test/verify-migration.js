#!/usr/bin/env node

/**
 * Script de vérification de la migration des membres d'organisation
 * Vérifie que toutes les données ont été correctement migrées
 *
 * Usage: node scripts/verify-migration.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Vérification de la migration
 */
async function verifyMigration() {
  console.log(
    "🔍 Vérification de la migration des membres d'organisation...\n"
  );

  try {
    // Récupération de toutes les organisations
    const organizations = await prisma.organization.findMany({
      include: {
        organizationMembers: {
          include: {
            user: {
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`📊 ${organizations.length} organisations trouvées\n`);

    let totalMembers = 0;
    let totalOwners = 0;
    let totalAdmins = 0;
    let totalRegularMembers = 0;

    for (const org of organizations) {
      console.log(`🏢 ${org.name} (ID: ${org.id})`);
      console.log(`  📋 Nombre de membres: ${org.memberCount}`);
      console.log(
        `  📊 Membres dans la nouvelle table: ${org.organizationMembers.length}`
      );

      // Vérification de la cohérence
      if (org.memberCount !== org.organizationMembers.length) {
        console.log(
          `  ⚠️  INCOHÉRENCE: memberCount (${org.memberCount}) ≠ membres réels (${org.organizationMembers.length})`
        );
      }

      // Détails des membres
      for (const member of org.organizationMembers) {
        const userName =
          `${member.user.firstname || ""} ${
            member.user.lastname || ""
          }`.trim() || member.user.email;
        console.log(`    👤 ${userName} (${member.userUid}) - ${member.role}`);

        totalMembers++;
        switch (member.role) {
          case "owner":
            totalOwners++;
            break;
          case "admin":
            totalAdmins++;
            break;
          default:
            totalRegularMembers++;
        }
      }

      // Vérification du propriétaire
      const owner = org.organizationMembers.find((m) => m.role === "owner");
      if (!owner) {
        console.log(
          `  ⚠️  ATTENTION: Aucun propriétaire trouvé pour ${org.name}`
        );
      } else if (owner.userUid !== org.ownerUid) {
        console.log(
          `  ⚠️  INCOHÉRENCE: Propriétaire dans members (${owner.userUid}) ≠ ownerUid (${org.ownerUid})`
        );
      }

      console.log("");
    }

    // Statistiques globales
    console.log("📈 STATISTIQUES GLOBALES:");
    console.log(`  🏢 Organisations: ${organizations.length}`);
    console.log(`  👥 Total membres: ${totalMembers}`);
    console.log(`  👑 Propriétaires: ${totalOwners}`);
    console.log(`  🔧 Admins: ${totalAdmins}`);
    console.log(`  👤 Membres réguliers: ${totalRegularMembers}`);

    // Vérification des utilisateurs orphelins
    console.log("\n🔍 Vérification des utilisateurs orphelins...");

    const allUsers = await prisma.user.findMany({
      include: {
        organizationMembers: true,
      },
    });

    const orphanUsers = allUsers.filter(
      (user) => user.organizationMembers.length === 0
    );

    if (orphanUsers.length > 0) {
      console.log(`⚠️  ${orphanUsers.length} utilisateurs sans organisation:`);
      orphanUsers.forEach((user) => {
        const userName =
          `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email;
        console.log(`  👤 ${userName} (${user.uid})`);
      });
    } else {
      console.log(
        "✅ Tous les utilisateurs sont membres d'au moins une organisation"
      );
    }

    // Vérification des contraintes d'unicité
    console.log("\n🔍 Vérification des contraintes d'unicité...");

    const duplicateMembers = await prisma.$queryRaw`
      SELECT "organizationId", "userUid", COUNT(*) as count
      FROM "OrganizationMember"
      GROUP BY "organizationId", "userUid"
      HAVING COUNT(*) > 1
    `;

    if (duplicateMembers.length > 0) {
      console.log("❌ DOUBLONS DÉTECTÉS:");
      duplicateMembers.forEach((dup) => {
        console.log(
          `  Organisation ${dup.organizationId}, Utilisateur ${dup.userUid}: ${dup.count} occurrences`
        );
      });
    } else {
      console.log("✅ Aucun doublon détecté");
    }

    console.log("\n✅ Vérification terminée");
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
verifyMigration()
  .then(() => {
    console.log("\n✨ Script de vérification terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
