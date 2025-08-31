/**
 * Types pour l'authentification Google OAuth
 */

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export interface GoogleAuthRequest {
  code: string;
}

export interface GoogleAuthResponse {
  message: string;
  user: {
    uid: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
    profileImage: string | null;
  };
  hasOrganization: boolean;
}

export interface GoogleAuthError {
  error: string;
}
