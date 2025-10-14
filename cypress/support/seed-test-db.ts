// Script pour peupler la base de données de test
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function seedTestDatabase() {
  try {
    console.log("🌱 Seeding test database...");

    // Nettoyer la base de données
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.event.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.notification.deleteMany();

    // Créer des utilisateurs de test
    const testUsers = [
      {
        email: "test@example.com",
        password: "$2a$10$K7L1o45a", // Mot de passe hashé pour "TestPassword123!"
        firstname: "Test",
        lastname: "User",
        emailVerified: new Date(),
      },
      {
        email: "admin@example.com",
        password: "$2a$10$K7L1o45a", // Mot de passe hashé pour "AdminPassword123!"
        firstname: "Admin",
        lastname: "User",
        emailVerified: new Date(),
      },
      {
        email: "user1@example.com",
        password: "$2a$10$K7L1o45a",
        firstname: "User",
        lastname: "One",
        emailVerified: new Date(),
      },
    ];

    const users = await Promise.all(
      testUsers.map((user) => prisma.user.create({ data: user }))
    );

    console.log(`✅ Created ${users.length} test users`);

    // Créer une organisation de test
    const testOrg = await prisma.organization.create({
      data: {
        name: "Test Organization",
        bio: "Test organization for E2E tests",
        organizationType: "ASSOCIATION",
        mission: "Test mission",
        location: {
          city: "Paris",
          lat: 48.8566,
          lon: 2.3522,
          displayName: "Paris, France",
        },
        ownerId: users[0].id,
        members: {
          create: [
            {
              userId: users[0].id,
              role: "OWNER",
            },
            {
              userId: users[1].id,
              role: "ADMIN",
            },
          ],
        },
      },
    });

    console.log(`✅ Created test organization: ${testOrg.name}`);

    // Créer des événements de test
    const testEvents = [
      {
        title: "Test Event 1",
        description: "First test event",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        endDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ), // + 2 heures
        location: "Paris, France",
        organizationId: testOrg.id,
        createdById: users[0].id,
        status: "ACTIVE",
      },
      {
        title: "Test Event 2",
        description: "Second test event",
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
        endDate: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
        ), // + 3 heures
        location: "Lyon, France",
        organizationId: testOrg.id,
        createdById: users[1].id,
        status: "ACTIVE",
      },
    ];

    const events = await Promise.all(
      testEvents.map((event) => prisma.event.create({ data: event }))
    );

    console.log(`✅ Created ${events.length} test events`);

    // Créer des invitations de test
    const testInvitations = [
      {
        email: "invite1@example.com",
        organizationId: testOrg.id,
        invitedById: users[0].id,
        role: "MEMBER",
        status: "PENDING",
      },
      {
        email: "invite2@example.com",
        organizationId: testOrg.id,
        invitedById: users[1].id,
        role: "ADMIN",
        status: "PENDING",
      },
    ];

    const invitations = await Promise.all(
      testInvitations.map((invitation) =>
        prisma.invitation.create({ data: invitation })
      )
    );

    console.log(`✅ Created ${invitations.length} test invitations`);

    console.log("🎉 Test database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding test database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seed si ce fichier est appelé directement
if (require.main === module) {
  seedTestDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedTestDatabase };
