# Système de Messagerie de Groupe

## Vue d'ensemble

Le système de messagerie de groupe permet aux membres d'une organisation de communiquer ensemble en temps réel. Chaque organisation dispose automatiquement d'une conversation de groupe où tous les membres peuvent participer.

## Fonctionnalités

### 🚀 Création Automatique

- **Création automatique** : Une conversation de groupe est créée automatiquement lors de la création d'une organisation
- **Ajout automatique des membres** : Les nouveaux membres rejoignant l'organisation sont automatiquement ajoutés à la conversation de groupe
- **Synchronisation** : Les membres sont synchronisés automatiquement entre l'organisation et la conversation de groupe

### 💬 Messagerie Temps Réel

- **Messages instantanés** : Communication en temps réel via Socket.IO
- **Interface responsive** : Optimisée pour mobile et desktop
- **Gestion des états** : Indicateurs de connexion et de statut

### 👥 Gestion des Membres

- **Liste des membres** : Affichage de tous les participants avec leurs rôles
- **Rôles** : Distinction entre administrateurs et membres
- **Informations détaillées** : Nom, avatar, date d'adhésion

### 🎨 Interface Utilisateur

- **Design cohérent** : Même esthétique que la messagerie privée
- **Composants modulaires** : Architecture réutilisable et maintenable
- **Accessibilité** : Interface accessible et intuitive

## Architecture

### Composants Principaux

#### `GroupConversationSidebar`

- Affiche la liste des conversations de groupe
- Informations sur l'organisation active
- Recherche et filtrage des conversations

#### `GroupConversationView`

- Interface principale de conversation
- Zone de saisie de messages
- Gestion des messages en temps réel

#### `GroupMembersList`

- Liste des membres de la conversation
- Informations sur les rôles et statuts
- Interface modale pour les détails

#### `OrganizationInfo`

- Informations sur l'organisation active
- Nombre de membres et type d'organisation

### Hooks Personnalisés

#### `useGroupConversations`

- Gestion des conversations de groupe
- Synchronisation automatique des membres
- Mise à jour du titre de conversation

### APIs

#### `/api/organizations/[organizationId]/group-conversation`

- **GET** : Récupère ou crée la conversation de groupe
- **PATCH** : Met à jour le titre de la conversation

#### `/api/organizations/[organizationId]/group-conversation/sync-members`

- **POST** : Synchronise les membres de l'organisation avec la conversation

## Intégration

### Création d'Organisation

```typescript
// Dans src/app/api/organizations/create/route.ts
// Une conversation de groupe est créée automatiquement
await tx.conversation.create({
  data: {
    type: "GROUP",
    title: "Groupe de discussion",
    organizationId: createdOrg.id,
    members: {
      create: {
        userId: user.uid,
        role: "ADMIN",
      },
    },
  },
});
```

### Ajout de Membre

```typescript
// Dans src/app/api/invite/[code]/route.ts
// Les nouveaux membres sont automatiquement ajoutés
await tx.conversationMember.create({
  data: {
    conversationId: groupConversation.id,
    userId: userUid,
    role: "MEMBER",
  },
});
```

## Utilisation

### Page de Messagerie de Groupe

```typescript
// src/app/dashboard/messages/groups/page.tsx
export default function MessagesGroupsPage() {
  const { conversations } = useGroupConversations({
    autoFetch: true,
    autoSync: true,
  });

  // Interface de messagerie de groupe
}
```

### Hook de Conversation de Groupe

```typescript
// src/hooks/useGroupConversations.ts
const {
  conversations,
  isLoading,
  error,
  fetchGroupConversations,
  syncGroupMembers,
  updateGroupConversationTitle,
} = useGroupConversations({
  autoFetch: true,
  autoSync: true,
});
```

## Sécurité

### Vérifications d'Accès

- Vérification de l'appartenance à l'organisation
- Contrôle des permissions de conversation
- Validation des données d'entrée

### Gestion des Erreurs

- Gestion gracieuse des erreurs de connexion
- Retry automatique des opérations échouées
- Messages d'erreur informatifs

## Performance

### Optimisations

- Chargement paresseux des composants
- Mise en cache des données de conversation
- Synchronisation optimisée des membres

### Monitoring

- Logs détaillés des opérations
- Métriques de performance
- Surveillance de la connectivité

## Évolutions Futures

### Fonctionnalités Prévues

- [ ] Messages avec pièces jointes
- [ ] Réactions aux messages
- [ ] Notifications push
- [ ] Historique des messages
- [ ] Modération des conversations
- [ ] Intégration avec les événements

### Améliorations Techniques

- [ ] Pagination des messages
- [ ] Compression des données
- [ ] Optimisation des requêtes
- [ ] Tests automatisés
- [ ] Documentation API

## Support

Pour toute question ou problème concernant le système de messagerie de groupe, consultez :

- La documentation des composants
- Les logs de l'application
- L'équipe de développement
