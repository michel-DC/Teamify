/**
 * Utilitaires d'authentification pour le système de messagerie
 * Compatible avec l'ancien système server.js
 */

export interface AuthUser {
  uid: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  profileImage: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  isAuthenticated: boolean;
}

/**
 * Vérifier l'authentification via l'API /api/auth/me
 * Utilise les cookies comme dans l'ancien système server.js
 */
export async function checkAuthWithCookies(): Promise<AuthResponse> {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important pour envoyer les cookies
    });

    if (response.ok) {
      const data = await response.json();
      return {
        user: data.user,
        isAuthenticated: true,
      };
    } else {
      return {
        user: null as any,
        isAuthenticated: false,
      };
    }
  } catch (error) {
    console.error("❌ [AuthUtils] Error checking auth:", error);
    return {
      user: null as any,
      isAuthenticated: false,
    };
  }
}

/**
 * Obtenir l'utilisateur actuel depuis les cookies
 * Compatible avec l'ancien système
 */
export async function getCurrentUserFromCookies(): Promise<AuthUser | null> {
  const authResult = await checkAuthWithCookies();
  return authResult.isAuthenticated ? authResult.user : null;
}
