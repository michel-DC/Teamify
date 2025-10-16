function getLocalStorageData() {
  const data = {} as Record<string, any>;

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
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
  } catch (error) {
    console.warn("Erreur lors de la vérification du localStorage:", error);
  }

  return data;
}

function getSessionStorageData() {
  const data = {} as Record<string, any>;

  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      }
    }
  } catch (error) {
    console.warn("Erreur lors de la vérification de la sessionStorage:", error);
  }

  return data;
}

function getCookiesData() {
  const data = {} as Record<string, string>;

  try {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        data[name] = value;
      }
    });
  } catch (error) {
    console.warn("Erreur lors de la vérification des cookies:", error);
  }

  return data;
}

export function getPersistedDataStatus() {
  const localStorageData = getLocalStorageData();
  const sessionStorageData = getSessionStorageData();
  const cookiesData = getCookiesData();

  return {
    localStorage: localStorageData,
    sessionStorage: sessionStorageData,
    cookies: cookiesData,
    stores: {
      sidebar: !!localStorageData["sidebar-storage"],
      organizations: !!localStorageData["organizations-storage"],
      events: !!localStorageData["events-storage"],
      tasks: !!localStorageData["tasks-storage"],
    },
  };
}

function clearLocalStorageData() {
  const keysToRemove = [
    "sidebar-storage",
    "organizations-storage",
    "events-storage",
    "tasks-storage",
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
}

function clearSessionStorageData() {
  sessionStorage.clear();
}

function clearCookiesData() {
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
}

export function testDataPersistence() {
  console.group("🧪 Test de la persistance des données");

  try {
    clearLocalStorageData();
    clearSessionStorageData();
    clearCookiesData();
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }

  console.groupEnd();
}

export function checkUrlSegment(segment: string): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.includes(segment);
}

export function getCurrentUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
}
