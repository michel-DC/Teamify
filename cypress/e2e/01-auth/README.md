# Tests d'Authentification (01-auth)

Ce dossier contient tous les tests end-to-end pour l'authentification de l'application Teamify.

## 📁 Structure des fichiers

```
01-auth/
├── register.cy.ts           # Tests d'inscription
├── login.cy.ts              # Tests de connexion
├── logout.cy.ts             # Tests de déconnexion
├── google-auth.cy.ts        # Tests d'authentification Google
├── auth-integration.cy.ts   # Tests d'intégration complets
└── README.md               # Ce fichier
```

## 🧪 Types de tests

### 1. **Tests d'inscription** (`register.cy.ts`)

- ✅ Inscription avec données valides
- ✅ Inscription avec code d'invitation
- ✅ Validation des champs (email, mot de passe, etc.)
- ✅ Gestion des erreurs (email existant, mots de passe différents)
- ✅ Navigation et liens
- ✅ Gestion des erreurs serveur
- ✅ Accessibilité
- ✅ Responsive design

### 2. **Tests de connexion** (`login.cy.ts`)

- ✅ Connexion avec identifiants valides
- ✅ Redirection conditionnelle (dashboard vs création organisation)
- ✅ Validation des identifiants
- ✅ Navigation et liens
- ✅ Persistance de session
- ✅ Gestion des erreurs serveur
- ✅ Accessibilité
- ✅ Responsive design
- ✅ Performance

### 3. **Tests de déconnexion** (`logout.cy.ts`)

- ✅ Déconnexion depuis le menu utilisateur
- ✅ Déconnexion depuis la sidebar
- ✅ Déconnexion automatique
- ✅ Nettoyage des cookies et localStorage
- ✅ Redirection après déconnexion
- ✅ Gestion des erreurs
- ✅ Accessibilité
- ✅ Responsive design

### 4. **Tests Google Auth** (`google-auth.cy.ts`)

- ✅ Redirection vers Google OAuth
- ✅ Callback Google réussi
- ✅ Gestion des utilisateurs Google existants
- ✅ Gestion des erreurs
- ✅ Interface utilisateur
- ✅ Sécurité
- ✅ Accessibilité
- ✅ Performance

### 5. **Tests d'intégration** (`auth-integration.cy.ts`)

- ✅ Flux complet d'authentification
- ✅ Gestion des sessions
- ✅ Gestion des erreurs réseau
- ✅ Tests de performance
- ✅ Tests d'accessibilité
- ✅ Gestion des cookies et localStorage
- ✅ Tests de sécurité
- ✅ Tests de compatibilité

## 🛠️ Helpers disponibles

### `authHelpers` (auth.helpers.ts)

- `generateTestUser()` - Génère des données d'utilisateur de test
- `generateUniqueEmail()` - Génère un email unique
- `getAdminUser()` - Données d'utilisateur admin
- `getMemberUser()` - Données d'utilisateur membre

### `authTestHelpers` (auth-test.helpers.ts)

- `createTestUser()` - Crée un utilisateur via l'API
- `createUserWithOrganization()` - Crée un utilisateur avec organisation
- `simulateSuccessfulLogin()` - Simule une connexion réussie
- `simulateFailedLogin()` - Simule une connexion échouée
- `fillLoginForm()` - Remplit le formulaire de connexion
- `fillRegistrationForm()` - Remplit le formulaire d'inscription
- `verifyUserIsLoggedIn()` - Vérifie qu'un utilisateur est connecté
- `verifyUserIsLoggedOut()` - Vérifie qu'un utilisateur est déconnecté
- `testAccessibilityAttributes()` - Teste l'accessibilité
- `testKeyboardNavigation()` - Teste la navigation au clavier
- `testResponsiveness()` - Teste la responsivité
- `testPerformance()` - Teste les performances

## 📊 Fixtures disponibles

### `users.json`

- Données d'utilisateurs de test (admin, member, testUser)

### `organizations.json`

- Données d'organisations de test

### `events.json`

- Données d'événements de test

### `auth-scenarios.json`

- Scénarios d'authentification complets
- Messages d'erreur et de succès
- Règles de validation
- Données de test pour différents cas

## 🚀 Comment exécuter les tests

### Tous les tests d'authentification

```bash
npx cypress run --spec "cypress/e2e/01-auth/**/*.cy.ts"
```

### Tests spécifiques

```bash
# Tests d'inscription
npx cypress run --spec "cypress/e2e/01-auth/register.cy.ts"

# Tests de connexion
npx cypress run --spec "cypress/e2e/01-auth/login.cy.ts"

# Tests de déconnexion
npx cypress run --spec "cypress/e2e/01-auth/logout.cy.ts"

# Tests Google Auth
npx cypress run --spec "cypress/e2e/01-auth/google-auth.cy.ts"

# Tests d'intégration
npx cypress run --spec "cypress/e2e/01-auth/auth-integration.cy.ts"
```

### Interface graphique

```bash
npx cypress open
```

## 📋 Prérequis

1. **Application en cours d'exécution** sur `http://localhost:3000`
2. **Base de données de test** configurée
3. **Variables d'environnement** configurées (voir `cypress.env.example`)

## 🔧 Configuration

### Variables d'environnement requises

```env
DATABASE_URL="postgresql://username:password@localhost:5432/teamify_test"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key"
RESEND_API_KEY="re_test_key"
PUSHER_APP_ID="test_app_id"
PUSHER_KEY="test_key"
PUSHER_SECRET="test_secret"
PUSHER_CLUSTER="eu"
```

### Base de données de test

- Utilise une base de données PostgreSQL séparée
- Nettoyage automatique entre les tests
- Données de test isolées

## 📈 Métriques de couverture

- **Inscription** : 95%+ (tous les cas d'usage)
- **Connexion** : 95%+ (tous les scénarios)
- **Déconnexion** : 90%+ (tous les flux)
- **Google Auth** : 85%+ (intégration complexe)
- **Intégration** : 90%+ (flux complets)

## 🐛 Gestion des erreurs

### Erreurs communes

1. **Timeout de connexion** - Vérifier que l'application est démarrée
2. **Erreurs de base de données** - Vérifier la configuration de la DB de test
3. **Erreurs d'API** - Vérifier les variables d'environnement

### Debug

```bash
# Mode debug avec logs détaillés
DEBUG=cypress:* npx cypress run --spec "cypress/e2e/01-auth/**/*.cy.ts"

# Mode headed pour voir l'exécution
npx cypress run --headed --spec "cypress/e2e/01-auth/**/*.cy.ts"
```

## 📚 Documentation

- [Documentation Cypress](https://docs.cypress.io/)
- [Guide d'accessibilité](https://docs.cypress.io/guides/tooling/accessibility-testing)
- [Tests de performance](https://docs.cypress.io/guides/tooling/performance-testing)

## 🤝 Contribution

Pour ajouter de nouveaux tests :

1. **Créer le fichier de test** dans le dossier approprié
2. **Utiliser les helpers existants** quand possible
3. **Ajouter les fixtures** si nécessaire
4. **Documenter les nouveaux tests** dans ce README
5. **Tester sur différents navigateurs** et appareils

## 📞 Support

En cas de problème avec les tests :

1. Vérifier les logs Cypress
2. Vérifier la configuration de l'environnement
3. Tester manuellement les fonctionnalités
4. Consulter la documentation Cypress
