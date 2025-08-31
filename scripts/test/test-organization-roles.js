const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * @param Script de test du système de rôles d'organisation
 *
 * Vérifie que le système de rôles fonctionne correctement
 */
async function testOrganizationRoles() {
  console.log("🧪 Test du système de rôles d'organisation...\n");

  try {
    // Récupérer toutes les organisations avec leurs membres
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

    for (const org of organizations) {
      console.log(`🏢 Organisation: ${org.name} (ID: ${org.id})`);
      console.log(`   Propriétaire: ${org.ownerUid}`);
      console.log(`   Membres:`);

      for (const member of org.organizationMembers) {
        const userInfo = member.user;
        const displayName =
          `${userInfo.firstname || ""} ${userInfo.lastname || ""}`.trim() ||
          userInfo.email;

        console.log(
          `     - ${displayName} (${member.userUid}): ${member.role}`
        );

        // Vérifier si le propriétaire a bien le rôle OWNER
        if (member.userUid === org.ownerUid && member.role !== "OWNER") {
          console.log(
            `       ⚠️  ERREUR: Le propriétaire n'a pas le rôle OWNER!`
          );
        }
      }

      // Vérifier qu'il y a exactement un OWNER
      const owners = org.organizationMembers.filter((m) => m.role === "OWNER");
      if (owners.length === 0) {
        console.log(`   ❌ ERREUR: Aucun propriétaire trouvé!`);
      } else if (owners.length > 1) {
        console.log(
          `   ⚠️  ATTENTION: ${owners.length} propriétaires trouvés!`
        );
      } else {
        console.log(`   ✅ Propriétaire correctement défini`);
      }

      console.log("");
    }

    // Test des permissions
    console.log("🔐 Test des permissions...\n");

    for (const org of organizations) {
      const members = org.organizationMembers;

      for (const member of members) {
        const userInfo = member.user;
        const displayName =
          `${userInfo.firstname || ""} ${userInfo.lastname || ""}`.trim() ||
          userInfo.email;

        console.log(`👤 ${displayName} (${member.role}) dans ${org.name}:`);

        // Tester les permissions selon le rôle
        const canModify = member.role === "OWNER" || member.role === "ADMIN";
        const canDelete = member.role === "OWNER";

        console.log(`   - Peut modifier: ${canModify ? "✅" : "❌"}`);
        console.log(`   - Peut supprimer: ${canDelete ? "✅" : "❌"}`);
      }
      console.log("");
    }

    console.log("🎉 Tests terminés avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests
testOrganizationRoles()
  .then(() => {
    console.log("✅ Script de test terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
