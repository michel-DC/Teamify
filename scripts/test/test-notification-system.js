/**
 * Script de test pour le système de notifications
 * Teste la création, récupération et gestion des notifications
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testNotificationSystem() {
  console.log("🧪 Test du système de notifications...\n");

  try {
    // 1. Récupérer un utilisateur existant
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log("❌ Aucun utilisateur trouvé pour les tests");
      return;
    }

    console.log(`✅ Utilisateur de test: ${user.email} (${user.uid})`);

    // 2. Récupérer une organisation existante
    const organization = await prisma.organization.findFirst({
      where: {
        ownerUid: user.uid,
      },
    });

    if (!organization) {
      console.log("❌ Aucune organisation trouvée pour les tests");
      return;
    }

    console.log(
      `✅ Organisation de test: ${organization.name} (${organization.publicId})`
    );

    // 3. Récupérer un événement existant
    const event = await prisma.event.findFirst({
      where: {
        orgId: organization.id,
      },
    });

    if (!event) {
      console.log("❌ Aucun événement trouvé pour les tests");
      return;
    }

    console.log(`✅ Événement de test: ${event.title} (${event.publicId})`);

    // 4. Créer une notification de test
    console.log("\n📝 Création d'une notification de test...");

    const testNotification = await prisma.notification.create({
      data: {
        notificationName: "Test de notification",
        notificationDescription:
          "Ceci est une notification de test créée par le script.",
        notificationType: "INFO",
        userUid: user.uid,
        eventPublicId: event.publicId,
        organizationPublicId: organization.publicId,
      },
    });

    console.log(`✅ Notification créée: ${testNotification.publicId}`);

    // 5. Récupérer les notifications de l'utilisateur
    console.log("\n📋 Récupération des notifications...");

    const userNotifications = await prisma.notification.findMany({
      where: {
        userUid: user.uid,
      },
      include: {
        event: {
          select: {
            title: true,
            publicId: true,
          },
        },
        organization: {
          select: {
            name: true,
            publicId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    console.log(`✅ ${userNotifications.length} notifications trouvées:`);
    userNotifications.forEach((notification, index) => {
      console.log(
        `   ${index + 1}. ${notification.notificationName} (${
          notification.notificationType
        })`
      );
      console.log(`      ${notification.notificationDescription}`);
      if (notification.event) {
        console.log(`      Événement: ${notification.event.title}`);
      }
      if (notification.organization) {
        console.log(`      Organisation: ${notification.organization.name}`);
      }
      console.log(`      Lu: ${notification.isRead ? "Oui" : "Non"}`);
      console.log(
        `      Date: ${notification.notificationDate.toLocaleString()}`
      );
      console.log("");
    });

    // 6. Compter les notifications non lues
    console.log("📊 Statistiques des notifications...");

    const unreadCount = await prisma.notification.count({
      where: {
        userUid: user.uid,
        isRead: false,
      },
    });

    const totalCount = await prisma.notification.count({
      where: {
        userUid: user.uid,
      },
    });

    console.log(`✅ Total: ${totalCount} notifications`);
    console.log(`✅ Non lues: ${unreadCount} notifications`);

    // 7. Marquer la notification de test comme lue
    console.log("\n✅ Marquage de la notification de test comme lue...");

    await prisma.notification.update({
      where: {
        publicId: testNotification.publicId,
      },
      data: {
        isRead: true,
      },
    });

    console.log("✅ Notification marquée comme lue");

    // 8. Vérifier le nouveau compteur
    const newUnreadCount = await prisma.notification.count({
      where: {
        userUid: user.uid,
        isRead: false,
      },
    });

    console.log(`✅ Nouvelles notifications non lues: ${newUnreadCount}`);

    // 9. Nettoyer - supprimer la notification de test
    console.log("\n🧹 Nettoyage - suppression de la notification de test...");

    await prisma.notification.delete({
      where: {
        publicId: testNotification.publicId,
      },
    });

    console.log("✅ Notification de test supprimée");

    console.log("\n🎉 Test du système de notifications terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testNotificationSystem();
