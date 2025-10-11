# Scripts

Ce dossier contient les scripts utilitaires du projet Teamify, organisés en deux catégories principales :

## Dossier `test/`

Contient des scripts de test pour des mini-fonctionnalités de l'application. Ces scripts permettent de tester des composants ou des fonctionnalités spécifiques de manière isolée. Ils ne constituent pas des tests unitaires ou d'intégration formels, mais plutôt des outils de validation rapide.

### Types de tests disponibles :

- **Authentification** : Tests du flux d'auth, Google OAuth, validation des tokens
- **Socket.IO** : Tests de connexion, messagerie temps réel, événements
- **API** : Tests des endpoints, conversations, messages, organisations
- **Configuration** : Vérification des variables d'environnement, Google config
- **Migration** : Scripts de migration des données, rôles d'organisation
- **Interface** : Tests des composants UI, affichage des images, navigation

### Exemples de scripts :

- `test-auth-flow.js` : Test complet du flux d'authentification
- `test-google-oauth.js` : Validation de l'intégration Google OAuth
- `test-socket-io.js` : Test des connexions Socket.IO et événements
- `test-realtime-messaging.js` : Validation de la messagerie temps réel
- `migrate-organization-members.js` : Migration des membres d'organisation

## Dossier `prisma/`

Contient les scripts liés à Prisma pour la gestion de la base de données.

### Scripts disponibles :

- **`delete-prisma-migrations-history.js`** : Supprime l'historique des migrations Prisma (utile pour nettoyer la table `_prisma_migrations`)

### Utilisation :

Ces scripts facilitent les opérations de maintenance et de déploiement de la base de données, notamment lors des phases de développement où il peut être nécessaire de réinitialiser l'état des migrations.
