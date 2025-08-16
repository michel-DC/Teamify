import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    /**
     * Récupération de l'utilisateur connecté
     */
    const user = await getCurrentUser();

    if (!user) {
      console.log("API Stats: Utilisateur non authentifié");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("API Stats: Utilisateur authentifié:", user.uid);

    // Récupérer toutes les organisations dont l'utilisateur est propriétaire
    const ownedOrganizations = await prisma.organization.findMany({
      where: { ownerUid: user.uid },
      include: {
        events: {
          include: {
            invitations: true,
            preparationTodos: true,
            preparationTodoGroups: true,
          },
        },
      },
    });

    // Récupérer toutes les organisations dont l'utilisateur est membre
    const memberOrganizations = await prisma.organization.findMany({
      where: {
        organizationMembers: {
          some: {
            userUid: user.uid,
          },
        },
      },
      include: {
        events: {
          include: {
            invitations: true,
            preparationTodos: true,
            preparationTodoGroups: true,
          },
        },
      },
    });

    // Combiner les deux listes en évitant les doublons
    const allOrganizations = [...ownedOrganizations];
    memberOrganizations.forEach((memberOrg) => {
      const isAlreadyIncluded = allOrganizations.some(
        (org) => org.id === memberOrg.id
      );
      if (!isAlreadyIncluded) {
        allOrganizations.push(memberOrg);
      }
    });

    console.log("API Stats: Organisations trouvées:", allOrganizations.length);
    console.log(
      "API Stats: Événements trouvés:",
      allOrganizations.reduce((sum, org) => sum + org.events.length, 0)
    );

    // Calculer les statistiques détaillées
    const stats = {
      // Statistiques de base
      totalOrganizations: allOrganizations.length,
      totalMembers: allOrganizations.reduce(
        (sum, org) => sum + org.memberCount,
        0
      ),
      totalEvents: allOrganizations.reduce(
        (sum, org) => sum + org.eventCount,
        0
      ),

      // Statistiques par type d'organisation
      organizationTypes: {
        ASSOCIATION: allOrganizations.filter(
          (org) => org.organizationType === "ASSOCIATION"
        ).length,
        PME: allOrganizations.filter((org) => org.organizationType === "PME")
          .length,
        ENTREPRISE: allOrganizations.filter(
          (org) => org.organizationType === "ENTREPRISE"
        ).length,
        STARTUP: allOrganizations.filter(
          (org) => org.organizationType === "STARTUP"
        ).length,
        AUTO_ENTREPRENEUR: allOrganizations.filter(
          (org) => org.organizationType === "AUTO_ENTREPRENEUR"
        ).length,
      },

      // Statistiques des événements
      eventsStats: {
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        averageCapacity: 0,
        totalInvitations: 0,
        averageInvitationsPerEvent: 0,
        eventsWithLocation: 0,
        eventsWithBudget: 0,
        totalBudget: 0,
      },

      // Statistiques des tâches de préparation
      todosStats: {
        totalTodos: 0,
        completedTodos: 0,
        pendingTodos: 0,
        completionRate: 0,
        totalTodoGroups: 0,
        averageTodosPerEvent: 0,
      },

      // Statistiques temporelles
      temporalStats: {
        organizationsCreatedThisMonth: 0,
        organizationsCreatedThisYear: 0,
        eventsCreatedThisMonth: 0,
        eventsCreatedThisYear: 0,
        averageEventsPerOrg: 0,
        averageMembersPerOrg: 0,
      },
    };

    // Calculer les statistiques des événements
    const allEvents = allOrganizations.flatMap((org) => org.events);
    stats.eventsStats.totalEvents = allEvents.length;
    stats.eventsStats.upcomingEvents = allEvents.filter(
      (event) => event.status === "A_VENIR"
    ).length;
    stats.eventsStats.completedEvents = allEvents.filter(
      (event) => event.status === "TERMINE"
    ).length;
    stats.eventsStats.cancelledEvents = allEvents.filter(
      (event) => event.isCancelled
    ).length;

    const eventsWithCapacity = allEvents.filter((event) => event.capacity > 0);
    stats.eventsStats.averageCapacity =
      eventsWithCapacity.length > 0
        ? Math.round(
            eventsWithCapacity.reduce((sum, event) => sum + event.capacity, 0) /
              eventsWithCapacity.length
          )
        : 0;

    stats.eventsStats.totalInvitations = allEvents.reduce(
      (sum, event) => sum + event.invitations.length,
      0
    );
    stats.eventsStats.averageInvitationsPerEvent =
      allEvents.length > 0
        ? Math.round(
            (stats.eventsStats.totalInvitations / allEvents.length) * 10
          ) / 10
        : 0;

    stats.eventsStats.eventsWithLocation = allEvents.filter(
      (event) => event.locationCoords
    ).length;
    stats.eventsStats.eventsWithBudget = allEvents.filter(
      (event) => event.budget && event.budget > 0
    ).length;
    stats.eventsStats.totalBudget = allEvents.reduce(
      (sum, event) => sum + (event.budget || 0),
      0
    );

    // Calculer les statistiques des tâches
    const allTodos = allEvents.flatMap((event) => event.preparationTodos);
    stats.todosStats.totalTodos = allTodos.length;
    stats.todosStats.completedTodos = allTodos.filter(
      (todo) => todo.done
    ).length;
    stats.todosStats.pendingTodos = allTodos.filter(
      (todo) => !todo.done
    ).length;
    stats.todosStats.completionRate =
      allTodos.length > 0
        ? Math.round((stats.todosStats.completedTodos / allTodos.length) * 100)
        : 0;

    const allTodoGroups = allEvents.flatMap(
      (event) => event.preparationTodoGroups
    );
    stats.todosStats.totalTodoGroups = allTodoGroups.length;
    stats.todosStats.averageTodosPerEvent =
      allEvents.length > 0
        ? Math.round((allTodos.length / allEvents.length) * 10) / 10
        : 0;

    // Calculer les statistiques temporelles
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    stats.temporalStats.organizationsCreatedThisMonth = allOrganizations.filter(
      (org) => new Date(org.createdAt) >= thisMonth
    ).length;

    stats.temporalStats.organizationsCreatedThisYear = allOrganizations.filter(
      (org) => new Date(org.createdAt) >= thisYear
    ).length;

    stats.temporalStats.eventsCreatedThisMonth = allEvents.filter(
      (event) => new Date(event.createdAt) >= thisMonth
    ).length;

    stats.temporalStats.eventsCreatedThisYear = allEvents.filter(
      (event) => new Date(event.createdAt) >= thisYear
    ).length;

    stats.temporalStats.averageEventsPerOrg =
      allOrganizations.length > 0
        ? Math.round((allEvents.length / allOrganizations.length) * 10) / 10
        : 0;

    stats.temporalStats.averageMembersPerOrg =
      allOrganizations.length > 0
        ? Math.round((stats.totalMembers / allOrganizations.length) * 10) / 10
        : 0;

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
