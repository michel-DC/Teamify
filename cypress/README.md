# Tests E2E avec Cypress

## Installation

Les dépendances Cypress sont déjà installées via pnpm.

## Scripts disponibles

- `pnpm cypress:open` - Ouvrir l'interface Cypress
- `pnpm cypress:run` - Lancer tous les tests en mode headless
- `pnpm cypress:run:auth` - Lancer uniquement les tests d'authentification
- `pnpm test:e2e` - Lancer le serveur de dev et les tests d'authentification

## Structure des tests

```
cypress/
├── e2e/
│   └── auth/
│       ├── login.spec.cy.ts
│       ├── register.spec.cy.ts
│       └── google-auth.spec.cy.ts
├── fixtures/
│   ├── users.json
│   ├── google-provider.json
│   └── google-callback.json
└── support/
    ├── commands.ts
    └── e2e.ts
```

## Tests d'authentification

### Tests de connexion
- Connexion avec identifiants valides
- Connexion avec identifiants invalides
- Validation des champs obligatoires
- Redirection après connexion

### Tests d'inscription
- Inscription avec données valides
- Inscription avec email existant
- Validation du mot de passe
- Validation de l'email
- Redirection après inscription

### Tests Google OAuth
- Redirection vers Google
- Gestion du callback Google
- Stockage des données utilisateur
- Gestion des erreurs OAuth

## Configuration

Les tests utilisent la base de données de développement.

## Sécurité

- Les tests ne fonctionnent qu'en environnement de développement
- Les données de test sont isolées
- Aucune donnée sensible n'est exposée
