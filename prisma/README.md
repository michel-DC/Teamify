# Base de Données Teamify

Cette documentation décrit l'architecture et la structure de la base de données PostgreSQL utilisée par l'application Teamify.

## Configuration

- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **URL de connexion** : Variable d'environnement `DATABASE_URL`

## Architecture Générale

La base de données est organisée autour de plusieurs entités principales :

- **Utilisateurs** et **Organisations** (gestion des comptes et structures)
- **Événements** et **Invitations** (gestion des événements)
- **Messagerie** (conversations et messages)
- **Notifications** (système d'alertes)
- **Permissions** (gestion des rôles et accès)

## Tables Principales

### User

Table centrale des utilisateurs de l'application.

**Champs principaux :**

- `uid` : Identifiant unique (clé primaire)
- `email` : Email unique de l'utilisateur
- `password` : Mot de passe hashé
- `firstname`, `lastname` : Informations personnelles
- `profileImage` : Image de profil
- `googleId` : ID Google pour l'authentification OAuth
- `bio`, `dateOfBirth`, `location`, `phone`, `website` : Profil étendu

**Relations :**

- Propriétaire d'organisations (`organizations`)
- Membre d'organisations (`organizationMembers`)
- Créateur d'événements (`event`)
- Participant aux conversations (`conversationMembers`)
- Auteur de messages (`messages`)

### Organization

Représente les organisations/entreprises utilisant la plateforme.

**Champs principaux :**

- `id` : Identifiant unique
- `name` : Nom de l'organisation
- `bio`, `mission` : Description et mission
- `profileImage` : Logo de l'organisation
- `memberCount` : Nombre de membres
- `organizationType` : Type d'organisation (ASSOCIATION, PME, ENTREPRISE, etc.)
- `location` : Localisation (JSON)
- `publicId` : Identifiant public unique

**Relations :**

- Propriétaire (`owner`) : Référence vers User
- Membres (`organizationMembers`)
- Événements (`events`)
- Conversations (`conversations`)

### Event

Gestion des événements organisés par les organisations.

**Champs principaux :**

- `id` : Identifiant unique
- `title`, `description` : Informations de l'événement
- `location`, `locationCoords` : Lieu et coordonnées
- `startDate`, `endDate` : Dates de début et fin
- `capacity` : Nombre maximum de participants
- `status` : Statut (A_VENIR, EN_COURS, TERMINE, ANNULE)
- `category` : Catégorie (REUNION, SEMINAIRE, CONFERENCE, etc.)
- `eventCode` : Code unique pour rejoindre l'événement
- `preparationPercentage` : Pourcentage de préparation

**Relations :**

- Organisation (`organization`)
- Propriétaire (`owner`)
- Invitations (`invitations`)
- Todos de préparation (`preparationTodos`)

## Système de Messagerie

### Conversation

Gestion des conversations entre utilisateurs.

**Types :**

- `PRIVATE` : Conversation privée entre deux utilisateurs
- `GROUP` : Conversation de groupe

### Message

Messages dans les conversations.

**Fonctionnalités :**

- Contenu textuel
- Pièces jointes (JSON)
- Horodatage
- Système de reçus (`MessageReceipt`)

### MessageReceipt

Suivi de la livraison et lecture des messages.

**Statuts :**

- `DELIVERED` : Message livré
- `READ` : Message lu

## Système d'Invitations

### OrganizationInvite

Invitations à rejoindre une organisation.

**Statuts :**

- `PENDING` : En attente
- `ACCEPTED` : Acceptée
- `DECLINED` : Refusée

### Invitation

Invitations à participer à un événement.

**Fonctionnalités :**

- Invitation par email
- Statut de réponse
- Lien unique (`invitationId`)

## Gestion des Rôles et Permissions

### OrganizationMember

Membres d'une organisation avec leurs rôles.

**Rôles :**

- `OWNER` : Propriétaire
- `ADMIN` : Administrateur
- `MEMBER` : Membre

### OrganizationPermissions

Configuration des permissions par organisation.

**Permissions configurables :**

- Modification/suppression d'événements
- Invitation de participants
- Invitation de membres
- Modification de l'organisation

## Système de Notifications

### Notification

Notifications pour les utilisateurs.

**Types :**

- `INFO` : Information générale
- `SUCCESS` : Succès
- `WARNING` : Avertissement
- `ERROR` : Erreur
- `INVITATION` : Invitation
- `REMINDER` : Rappel
- `UPDATE` : Mise à jour

## Gestion des Todos

### PreparationTodoGroup

Groupes de tâches de préparation d'événement.

### PreparationTodo

Tâches individuelles de préparation.

**Fonctionnalités :**

- Assignation à un utilisateur
- Groupement par catégories
- Suivi de l'avancement
- Ordre personnalisable

## Enums et Types

### EventStatus

- `A_VENIR` : À venir
- `EN_COURS` : En cours
- `TERMINE` : Terminé
- `ANNULE` : Annulé

### EventCategory

- `REUNION`, `SEMINAIRE`, `CONFERENCE`
- `FORMATION`, `ATELIER`, `NETWORKING`
- `CEREMONIE`, `EXPOSITION`, `CONCERT`
- `SPECTACLE`, `AUTRE`

### OrganizationType

- `ASSOCIATION` : Association
- `PME` : Petite et moyenne entreprise
- `ENTREPRISE` : Grande entreprise
- `STARTUP` : Startup
- `AUTO_ENTREPRENEUR` : Auto-entrepreneur

## Migrations

Le dossier `migrations/` contient l'historique des modifications de la base de données :

1. **20250902170500_init** : Migration initiale
2. **20250902171933_add_user_profile_fields** : Ajout des champs de profil utilisateur
3. **20250904190331_add_notifications** : Ajout du système de notifications
4. **20250907165426_fix_relations_fiels** : Correction des relations
5. **20250907170003_fix_relation_fields** : Correction finale des relations

## Index et Optimisations

- Index sur `[conversationId, createdAt]` pour les messages
- Contraintes d'unicité sur les combinaisons critiques
- Relations avec suppression en cascade pour l'intégrité
- Champs JSON pour la flexibilité (location, attachments, etc.)
