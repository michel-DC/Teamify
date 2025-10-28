# Authentification et Inscription Teamify

## Résumé des flux

- **Connexion Email/Password** (route : `/api/auth/login`)
- **Inscription** (route : `/api/auth/register`)
- **Connexion OAuth Google** (route : `/api/auth/google`)
- **Déconnexion** (route : `/api/auth/logout`)
- **Vérification email** (route : `/api/auth/check-email`)
- **Callback Google** (route : `/api/auth/google/callback`)

## 1. Connexion Email/Mot de passe
### Endpoint : `POST /api/auth/login`
- Body : `{ email, password }`
- Vérification de l’email et du hash de mot de passe (bcrypt).
- Génération d’un JWT signé (`generateToken`).
- Renvoi du token en cookie HTTP-only (durée : 7j).
- Retourne aussi si l’utilisateur a déjà une organisation créée.
- En cas d’échec (email inconnu, mauvais mot de passe) : erreur 401.
- Extrait de réponse OK :
```json
{
  "message": "Connexion réussie",
  "user": { "uid": "...", "email": "...", "firstname": "..." },
  "hasOrganization": true
}
```

## 2. Inscription (compte local)
### Endpoint : `POST /api/auth/register`
- Body attendu :
  - `email`, `firstname`, `lastname`, `passwordHash`, `inviteCode?`
- Vérifie email non utilisé.
- Hash du mot de passe (bcryptjs, 10 rounds).
- Si `inviteCode` : rattachement à une organisation (logique d’invitation spécifique).
- Création du user et envoi d’un email de bienvenue (`WelcomeEmailService`).
- Statut de la réponse selon réussite ou doublon :
    - Email déjà utilisé = 400 + message explicite
- Extrait de réponse OK :
```json
{
  "message": "Inscription réussie",
  "user": { ...fields... }
}
```

## 3. Connexion Google (OAuth 2)
### Flux résumé
- **Front** : redirection vers consent Google → retour sur `/api/auth/google/callback`
- **Callback (/callback)** : renvoie le `code` d’autorisation à `/api/auth/google` (POST).
- **Backend** :
  - Échange ce `code` contre un access_token Google.
  - Récupère l’info utilisateur.
  - Cherche `user` (par email/GoogleId) :
    - Maj du compte existant ou création rapide.
    - Mot de passe généré pour les comptes Google-only.
  - Génère un JWT, set cookie comme login classique, même logique hasOrganization.
- Réponse typique :
```json
{
  "message": "Connexion Google réussie",
  "user": { "uid": "...", "email": "...", "firstname": "..." },
  "hasOrganization": true
}
```

## 4. Déconnexion
### Endpoint : `POST /api/auth/logout`
- Supprime le cookie `token` (HTTP-only, scope `/`).
- Purge aussi les cookies techniques résidentiels (`isLoggedIn`, `hasOrganization`).
- Réponse : 200 + message ou erreur (jamais critique).

## 5. Vérification Email
### Endpoint : `POST /api/auth/check-email`
- Utile lors de l’inscription (évite doublon, UX).
- Body : `{ email }`
- Retourne 404 si email inconnu.
- Sinon, les infos d’utilisateur minimal (pour pré-remplir ou diagnostic).

## 6. Jetons et Cookie
- **JWT** : généré côté serveur, signé, payload minimal (`userUid`). Géré dans `src/lib/auth.ts`.
- **Stockage :** Cookie `token`, HTTP-only (jamais accessible JS côté client), valable 7 jours.
- **Vérification** : Sur chaque endpoint server-REST, la fonction utilitaire (`getCurrentUser`) lit le cookie, vérifie le JWT, puis charge l’utilisateur courant.

---

## 7. Providers/support multi-auth?
- Actuellement :
  - **Email + mot de passe local**
  - **Google OAuth** (social)
- Pas de NextAuth ou d’abstraction tiers, toute la logique est customisée.
- Le support de MagicLink ou autres réseaux sociaux est possible à étendre via de nouvelles routes.

## 8. Sécurité et bonnes pratiques
- Stockage des mots de passe : hash bcrypt fort.
- Cookies : sécurisés (HTTP-only, Secure en prod).
- JWT : secret configurable (`JWT_SECRET`).
- Anti-bruteforce : prévoir un WAF ou une limitation de requêtes côté provider/hébergement.
- **Jamais de mot de passe transmis ou stocké en clair.**

---

## 9. Flux résumé (diagramme)

1. **Inscription classique**
   - Form sign-up → POST `/api/auth/register` → création bdd → JWT Set-Cookie → redirect onboarding
2. **Connexion**
   - Form login → POST `/api/auth/login` → JWT Set-Cookie → redirect dashboard
3. **Connexion Google**
   - Click bouton Google → Redirection → Consent Google → Google callback → POST `/api/auth/google` → JWT/cookie → redirect
4. **Déconnexion**
   - POST `/api/auth/logout` → efface tous les cookies → redirect login

---

## 10. Maintenance et évolutions
- Toute la logique centrale (création JWT, user context, accès) dans `src/lib/auth.ts`.
- Les routes API d’auth sont dans `src/app/api/auth/*`.
- Si ajout de provider, s’inspirer du pattern Google/route existant et bien isoler la logique OAuth/stockage.

---

**Cette page doit servir de référence structurée au fonctionnement auth _Teamify_. Pour toute extension, suivre les standards sécurité Node/Next.**
