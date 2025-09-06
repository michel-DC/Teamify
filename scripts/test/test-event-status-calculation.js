/**
 * Script de test pour la logique de calcul automatique du statut d'événement
 *
 * Ce script teste les différentes logiques de calcul du statut basé sur les dates :
 * - Si la date de fin est passée → "TERMINE"
 * - Si la date de début est passée mais la date de fin est dans le futur → "EN_COURS"
 * - Sinon → "A_VENIR"
 *
 * La comparaison utilise UTC pour garantir la cohérence mondiale
 */

// Simulation des statuts d'événement (copie de l'enum Prisma)
const EventStatus = {
  A_VENIR: "A_VENIR",
  EN_COURS: "EN_COURS",
  TERMINE: "TERMINE",
  ANNULE: "ANNULE",
};

/**
 * Calcule automatiquement le statut d'un événement basé sur ses dates
 * Utilise UTC pour garantir la cohérence mondiale
 * @param {string|Date} startDate - Date de début de l'événement
 * @param {string|Date} endDate - Date de fin de l'événement
 * @returns {string} Le statut calculé automatiquement
 */
function calculateEventStatus(startDate, endDate) {
  // Utilisation d'UTC pour garantir la cohérence mondiale
  // Conversion en timestamps UTC pour une comparaison précise
  const now = new Date();
  const nowUTC = now.getTime(); // getTime() retourne déjà en millisecondes UTC

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Conversion en timestamps UTC
  const startUTC = start.getTime();
  const endUTC = end.getTime();

  // Si la date de fin est passée en UTC (incluant les minutes), l'événement est terminé
  if (endUTC < nowUTC) {
    return EventStatus.TERMINE;
  }

  // Si la date de début est passée mais la date de fin est dans le futur en UTC, l'événement est en cours
  if (startUTC < nowUTC && endUTC > nowUTC) {
    return EventStatus.EN_COURS;
  }

  // Sinon, l'événement est à venir
  return EventStatus.A_VENIR;
}

/**
 * Tests des différents scénarios
 */
function runTests() {
  console.log(
    "🧪 Tests de la logique de calcul automatique du statut d'événement (UTC)\n"
  );

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const oneHourAgo2 = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const testCases = [
    {
      name: "Événement terminé (fin dans le passé)",
      startDate: oneHourAgo2,
      endDate: oneHourAgo,
      expectedStatus: EventStatus.TERMINE,
    },
    {
      name: "Événement en cours (début passé, fin future)",
      startDate: oneHourAgo,
      endDate: oneHourFromNow,
      expectedStatus: EventStatus.EN_COURS,
    },
    {
      name: "Événement à venir (début et fin dans le futur)",
      startDate: oneHourFromNow,
      endDate: twoHoursFromNow,
      expectedStatus: EventStatus.A_VENIR,
    },
    {
      name: "Événement qui commence maintenant (début = maintenant)",
      startDate: now,
      endDate: oneHourFromNow,
      expectedStatus: EventStatus.EN_COURS,
    },
    {
      name: "Événement qui se termine maintenant (fin = maintenant)",
      startDate: oneHourAgo,
      endDate: now,
      expectedStatus: EventStatus.TERMINE,
    },
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);

    const result = calculateEventStatus(testCase.startDate, testCase.endDate);
    const passed = result === testCase.expectedStatus;

    if (passed) {
      console.log(`✅ PASS - Statut calculé: ${result}`);
      passedTests++;
    } else {
      console.log(
        `❌ FAIL - Attendu: ${testCase.expectedStatus}, Obtenu: ${result}`
      );
    }

    console.log(`   Début: ${testCase.startDate.toLocaleString()}`);
    console.log(`   Fin: ${testCase.endDate.toLocaleString()}`);
    console.log(`   Maintenant: ${now.toLocaleString()}`);
    console.log(`   Maintenant (UTC): ${now.toISOString()}`);
    console.log("");
  });

  // Résumé des tests
  console.log("📊 Résumé des tests");
  console.log(`Tests réussis: ${passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log("🎉 Tous les tests sont passés avec succès !");
  } else {
    console.log("⚠️  Certains tests ont échoué. Vérifiez la logique.");
  }

  return passedTests === totalTests;
}

/**
 * Tests de précision avec les minutes (UTC)
 */
function testMinutePrecision() {
  console.log("\n⏰ Tests de précision avec les minutes (UTC)\n");

  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

  const minuteTestCases = [
    {
      name: "Événement qui s'est terminé il y a 5 minutes",
      startDate: fiveMinutesAgo,
      endDate: fiveMinutesAgo,
      expectedStatus: EventStatus.TERMINE,
    },
    {
      name: "Événement qui commence dans 5 minutes",
      startDate: fiveMinutesFromNow,
      endDate: tenMinutesFromNow,
      expectedStatus: EventStatus.A_VENIR,
    },
    {
      name: "Événement qui se termine dans 5 minutes",
      startDate: fiveMinutesAgo,
      endDate: fiveMinutesFromNow,
      expectedStatus: EventStatus.EN_COURS,
    },
  ];

  minuteTestCases.forEach((testCase, index) => {
    console.log(`Test minute ${index + 1}: ${testCase.name}`);

    const result = calculateEventStatus(testCase.startDate, testCase.endDate);
    const passed = result === testCase.expectedStatus;

    if (passed) {
      console.log(`✅ PASS - Statut calculé: ${result}`);
    } else {
      console.log(
        `❌ FAIL - Attendu: ${testCase.expectedStatus}, Obtenu: ${result}`
      );
    }

    console.log(`   Début: ${testCase.startDate.toLocaleString()}`);
    console.log(`   Fin: ${testCase.endDate.toLocaleString()}`);
    console.log(`   Maintenant: ${now.toLocaleString()}`);
    console.log(`   Maintenant (UTC): ${now.toISOString()}`);
    console.log("");
  });
}

/**
 * Tests de cohérence UTC
 */
function testUTCConsistency() {
  console.log("\n🌍 Tests de cohérence UTC\n");

  // Créer des dates UTC spécifiques
  const utcNow = new Date();
  const utcStart = new Date(
    Date.UTC(
      utcNow.getUTCFullYear(),
      utcNow.getUTCMonth(),
      utcNow.getUTCDate(),
      utcNow.getUTCHours() - 1,
      0,
      0
    )
  );
  const utcEnd = new Date(
    Date.UTC(
      utcNow.getUTCFullYear(),
      utcNow.getUTCMonth(),
      utcNow.getUTCDate(),
      utcNow.getUTCHours() + 1,
      0,
      0
    )
  );

  console.log("Test de cohérence UTC:");
  console.log(`   Heure locale actuelle: ${utcNow.toLocaleString()}`);
  console.log(`   Heure UTC actuelle: ${utcNow.toISOString()}`);
  console.log(`   Début événement (UTC): ${utcStart.toISOString()}`);
  console.log(`   Fin événement (UTC): ${utcEnd.toISOString()}`);

  const result = calculateEventStatus(utcStart, utcEnd);
  console.log(`   Statut calculé: ${result}`);
  console.log("");
}

/**
 * Test avec des dates réelles
 */
function testRealDates() {
  console.log("\n🔍 Tests avec des dates réelles\n");

  const realTestCases = [
    {
      name: "Événement d'hier",
      startDate: "2024-01-01T10:00:00",
      endDate: "2024-01-01T12:00:00",
    },
    {
      name: "Événement de demain",
      startDate: "2025-01-01T10:00:00",
      endDate: "2025-01-01T12:00:00",
    },
    {
      name: "Événement en cours (début hier, fin demain)",
      startDate: "2024-12-31T10:00:00",
      endDate: "2025-01-02T12:00:00",
    },
  ];

  realTestCases.forEach((testCase, index) => {
    console.log(`Test réel ${index + 1}: ${testCase.name}`);
    const result = calculateEventStatus(testCase.startDate, testCase.endDate);
    console.log(`   Statut calculé: ${result}`);
    console.log(`   Début: ${testCase.startDate}`);
    console.log(`   Fin: ${testCase.endDate}`);
    console.log("");
  });
}

// Exécution des tests
if (require.main === module) {
  const success = runTests();
  testMinutePrecision();
  testUTCConsistency();
  testRealDates();

  // Code de sortie approprié
  process.exit(success ? 0 : 1);
}

module.exports = {
  calculateEventStatus,
  EventStatus,
};
