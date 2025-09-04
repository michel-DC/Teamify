/**
 * Script de test pour l'API des notifications
 * Teste les endpoints de l'API des notifications
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testNotificationAPI() {
  console.log("🧪 Test de l'API des notifications...\n");

  try {
    // 1. Récupérer un utilisateur existant
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log("❌ Aucun utilisateur trouvé pour les tests");
      return;
    }

    console.log(`✅ Utilisateur de test: ${user.email} (${user.uid})`);

    // 2. Créer un token de test (simulation)
    // Dans un vrai test, nous utiliserions un vrai token JWT
    console.log("\n🔑 Simulation d'un token d'authentification...");
    console.log(
      "Note: Dans un vrai test, nous utiliserions un token JWT valide"
    );

    // 3. Créer une notification de test
    console.log("\n📝 Création d'une notification de test...");

    const testNotification = await prisma.notification.create({
      data: {
        notificationName: "Test API Notification",
        notificationDescription:
          "Ceci est une notification de test pour l'API.",
        notificationType: "INFO",
        userUid: user.uid,
      },
    });

    console.log(`✅ Notification créée: ${testNotification.publicId}`);

    // 4. Tester les requêtes Prisma directement
    console.log("\n🔧 Test des requêtes Prisma pour les notifications...");

    // Test getUserNotifications (simulation)
    const notifications = await prisma.notification.findMany({
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
        notificationDate: "desc",
      },
      take: 10,
    });
    console.log(
      `✅ getUserNotifications: ${notifications.length} notifications récupérées`
    );

    // Test getUnreadNotificationCount (simulation)
    const unreadCount = await prisma.notification.count({
      where: {
        userUid: user.uid,
        isRead: false,
      },
    });
    console.log(
      `✅ getUnreadNotificationCount: ${unreadCount} notifications non lues`
    );

    // 5. Afficher les détails des notifications
    console.log("\n📋 Détails des notifications:");
    notifications.forEach((notification, index) => {
      console.log(
        `   ${index + 1}. ${notification.notificationName} (${
          notification.notificationType
        })`
      );
      console.log(`      ${notification.notificationDescription}`);
      console.log(`      Lu: ${notification.isRead ? "Oui" : "Non"}`);
      console.log(
        `      Date: ${notification.notificationDate.toLocaleString()}`
      );
      console.log("");
    });

    // 6. Nettoyer - supprimer la notification de test
    console.log("🧹 Nettoyage - suppression de la notification de test...");

    await prisma.notification.delete({
      where: {
        publicId: testNotification.publicId,
      },
    });

    console.log("✅ Notification de test supprimée");

    console.log("\n🎉 Test de l'API des notifications terminé avec succès !");
    console.log("\n📝 Note: Pour tester les endpoints HTTP, vous devez:");
    console.log("   1. Démarrer le serveur Next.js (npm run dev)");
    console.log("   2. Vous connecter pour obtenir un token JWT valide");
    console.log(
      "   3. Utiliser un client HTTP (Postman, curl, etc.) avec le token"
    );
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testNotificationAPI();
