#!/usr/bin/env node

/**
 * Script de rollback de la migration des membres d'organisation
 * Supprime toutes les données de la nouvelle table OrganizationMember
 * ATTENTION: Ce script supprime définitivement les données migrées !
 *
 * Usage: node scripts/rollback-migration.js --confirm
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Rollback de la migration
 */
async function rollbackMigration() {
  const args = process.argv.slice(2);

  if (!args.includes("--confirm")) {
    console.log(
      "⚠️  ATTENTION: Ce script va supprimer toutes les données de la table OrganizationMember !"
    );
    console.log(
      "Pour confirmer, exécutez: node scripts/rollback-migration.js --confirm"
    );
    process.exit(1);
  }

  console.log("🔄 Début du rollback de la migration...\n");

  try {
    // Comptage des membres avant suppression
    const memberCount = await prisma.organizationMember.count();
    console.log(`📊 ${memberCount} membres trouvés dans la nouvelle table`);

    if (memberCount === 0) {
      console.log("✅ Aucune donnée à supprimer");
      return;
    }

    // Confirmation finale
    console.log("⚠️  Êtes-vous sûr de vouloir supprimer toutes ces données ?");
    console.log("Cette action est irréversible !");

    // Suppression de tous les membres
    const deletedMembers = await prisma.organizationMember.deleteMany({});

    console.log(`✅ ${deletedMembers.count} membres supprimés`);

    // Réinitialisation du memberCount dans les organisations
    console.log("🔄 Réinitialisation du memberCount...");

    await prisma.organization.updateMany({
      data: {
        memberCount: 0,
      },
    });

    console.log(
      "✅ memberCount réinitialisé à 0 pour toutes les organisations"
    );

    console.log("\n🎉 Rollback terminé avec succès");
    console.log(
      "💡 Vous pouvez maintenant revenir à l'ancienne structure si nécessaire"
    );
  } catch (error) {
    console.error("❌ Erreur lors du rollback:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Gestion des erreurs non capturées
process.on("unhandledRejection", (error) => {
  console.error("❌ Erreur non gérée:", error);
  process.exit(1);
});

// Exécution
rollbackMigration()
  .then(() => {
    console.log("\n✨ Script de rollback terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
