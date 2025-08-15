/**
 * @param Utilitaires pour la gestion de persistance des données
 *
 * Fonctions utilitaires pour tester, déboguer et gérer
 * la persistance des données dans l'application
 */

/**
 * @param Vérification de l'état des données persistées
 *
 * Retourne un objet avec l'état actuel de toutes les données persistées
 */
export function getPersistedDataStatus() {
  const status = {
    localStorage: {} as Record<string, any>,
    sessionStorage: {} as Record<string, any>,
    cookies: {} as Record<string, string>,
    stores: {
      sidebar: false,
      organizations: false,
      events: false,
      tasks: false,
    },
  };

  // Vérification localStorage
  try {
    const keysToCheck = [
      "sidebar-storage",
      "organizations-storage",
      "events-storage",
      "tasks-storage",
      "isLoggedIn",
      "theme",
    ];

    keysToCheck.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          status.localStorage[key] = JSON.parse(value);
        } catch {
          status.localStorage[key] = value;
        }
      }
    });
  } catch (error) {
    console.warn("Erreur lors de la vérification du localStorage:", error);
  }

  // Vérification sessionStorage
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value) {
          try {
            status.sessionStorage[key] = JSON.parse(value);
          } catch {
            status.sessionStorage[key] = value;
          }
        }
      }
    }
  } catch (error) {
    console.warn("Erreur lors de la vérification de la sessionStorage:", error);
  }

  // Vérification cookies
  try {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        status.cookies[name] = value;
      }
    });
  } catch (error) {
    console.warn("Erreur lors de la vérification des cookies:", error);
  }

  // Vérification des stores (approximative via localStorage)
  status.stores.sidebar = !!status.localStorage["sidebar-storage"];
  status.stores.organizations = !!status.localStorage["organizations-storage"];
  status.stores.events = !!status.localStorage["events-storage"];
  status.stores.tasks = !!status.localStorage["tasks-storage"];

  return status;
}

/**
 * @param Affichage de l'état des données persistées
 *
 * Affiche dans la console l'état actuel de toutes les données persistées
 */
export function logPersistedDataStatus() {
  const status = getPersistedDataStatus();

  console.group("📊 État des données persistées");

  console.group("🏪 Stores Zustand");
  Object.entries(status.stores).forEach(([store, hasData]) => {
    console.log(`${store}: ${hasData ? "✅" : "❌"}`);
  });
  console.groupEnd();

  console.group("💾 localStorage");
  Object.entries(status.localStorage).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  console.groupEnd();

  console.group("🗂️ sessionStorage");
  Object.entries(status.sessionStorage).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  console.groupEnd();

  console.group("🍪 Cookies");
  Object.entries(status.cookies).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.groupEnd();

  console.groupEnd();
}

/**
 * @param Test de la fonctionnalité de persistance
 *
 * Simule le vidage des données et vérifie le résultat
 */
export function testDataPersistence() {
  console.group("🧪 Test de la persistance des données");

  console.log("État avant vidage:");
  logPersistedDataStatus();

  // Simulation du vidage
  try {
    // Vidage localStorage
    const keysToRemove = [
      "sidebar-storage",
      "organizations-storage",
      "events-storage",
      "tasks-storage",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Vidage sessionStorage
    sessionStorage.clear();

    // Vidage cookies de données
    const cookiesToRemove = [
      "sidebar-data",
      "organizations-data",
      "events-data",
      "user-preferences",
      "tasks-data",
    ];

    cookiesToRemove.forEach((cookieName) => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });

    console.log("État après vidage:");
    logPersistedDataStatus();

    console.log("✅ Test terminé avec succès");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }

  console.groupEnd();
}

/**
 * @param Vérification de la présence d'un segment dans l'URL
 *
 * Vérifie si l'URL actuelle contient un segment spécifique
 */
export function checkUrlSegment(segment: string): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.includes(segment);
}

/**
 * @param Obtention de l'URL actuelle
 *
 * Retourne l'URL actuelle de manière sécurisée
 */
export function getCurrentUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
}
