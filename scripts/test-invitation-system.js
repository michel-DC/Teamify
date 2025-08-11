const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * @param Test du système d'invitations
 *
 * Vérifie que le système d'invitations fonctionne correctement
 */
async function testInvitationSystem() {
  try {
    console.log("🧪 Test du système d'invitations...\n");

    // 1. Vérifier qu'il y a des événements
    console.log("1️⃣ Vérification des événements...");
    const events = await prisma.event.findMany({
      take: 1,
      include: {
        organization: true,
      },
    });

    if (events.length === 0) {
      console.log("❌ Aucun événement trouvé. Créez d'abord un événement.");
      return;
    }

    const event = events[0];
    console.log(`✅ Événement trouvé: ${event.title} (${event.eventCode})`);

    // 2. Créer une invitation de test
    console.log("\n2️⃣ Création d'une invitation de test...");
    const testInvitation = await prisma.invitation.create({
      data: {
        eventCode: event.eventCode,
        receiverName: "Test User",
        receiverEmail: "test@example.com",
        status: "PENDING",
        sentAt: new Date(),
      },
    });

    console.log(`✅ Invitation créée avec ID: ${testInvitation.id}`);
    // 3. Générer le code d'invitation
    console.log("\n3️⃣ Génération du code d'invitation...");
    const invitationCode = `${testInvitation.invitationId}+${event.eventCode}`;
    console.log(`✅ Code d'invitation: ${invitationCode}`);

    // 4. Tester la validation du code
    console.log("\n4️⃣ Test de validation du code...");
    const decodedCode = decodeInvitationCode(invitationCode);

    if (decodedCode) {
      console.log(
        `✅ Code décodé: invitationId=${decodedCode.invitationId}, eventCode=${decodedCode.eventCode}`
      );
    } else {
      console.log("❌ Erreur lors du décodage du code");
      console.log(`🔍 Code à décoder: ${invitationCode}`);
      console.log(`🔍 Parts après split: ${invitationCode.split("+")}`);
      return;
    }

    // 5. Vérifier que l'invitation existe
    console.log("\n5️⃣ Vérification de l'existence de l'invitation...");
    const foundInvitation = await prisma.invitation.findFirst({
      where: {
        invitationId: decodedCode.invitationId,
        eventCode: decodedCode.eventCode,
      },
      include: {
        event: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (foundInvitation) {
      console.log(
        `✅ Invitation trouvée: ${foundInvitation.receiverName} (${foundInvitation.receiverEmail})`
      );
      console.log(`✅ Événement: ${foundInvitation.event.title}`);
      console.log(
        `✅ Organisation: ${foundInvitation.event.organization.name}`
      );
    } else {
      console.log("❌ Invitation non trouvée");
      console.log(
        `🔍 Recherche avec: invitationId=${decodedCode.invitationId}, eventCode=${decodedCode.eventCode}`
      );

      // Vérifier si l'invitation existe avec l'ID
      const invitationById = await prisma.invitation.findUnique({
        where: { id: testInvitation.id },
        include: {
          event: true,
        },
      });

      if (invitationById) {
        console.log(`🔍 Invitation trouvée par ID: ${invitationById.id}`);
        console.log(`🔍 invitationId dans DB: ${invitationById.invitationId}`);
        console.log(`🔍 eventCode dans DB: ${invitationById.eventCode}`);
      }
      return;
    }

    // 6. Tester la mise à jour du statut
    console.log("\n6️⃣ Test de mise à jour du statut...");
    const updatedInvitation = await prisma.invitation.update({
      where: { id: testInvitation.id },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });

    console.log(`✅ Statut mis à jour: ${updatedInvitation.status}`);

    // 7. Nettoyer les données de test
    console.log("\n7️⃣ Nettoyage des données de test...");
    await prisma.invitation.delete({
      where: { id: testInvitation.id },
    });

    console.log("✅ Données de test supprimées");

    console.log("\n🎉 Tous les tests sont passés avec succès !");
    console.log("\n📋 Résumé:");
    console.log("- ✅ Création d'invitation");
    console.log("- ✅ Génération de code d'invitation");
    console.log("- ✅ Décodage de code d'invitation");
    console.log("- ✅ Validation d'invitation");
    console.log("- ✅ Mise à jour de statut");
    console.log(
      "- ✅ Format de lien: /join-event?code={invitationId}+{eventCode}"
    );
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error);
    throw error;
  }
}

/**
 * @param Décodage d'un code d'invitation
 *
 * Extrait l'invitationId (CUID) et le code d'événement du code combiné
 */
function decodeInvitationCode(code) {
  const parts = code.split("+");
  if (parts.length !== 2) {
    return null;
  }

  const invitationId = parts[0];
  const eventCode = parts[1];

  if (!invitationId || !eventCode) {
    return null;
  }

  return { invitationId, eventCode };
}

/**
 * @param Fonction principale
 *
 * Exécute les tests du système d'invitations
 */
async function main() {
  try {
    await testInvitationSystem();
  } catch (error) {
    console.error("❌ Erreur dans les tests:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
