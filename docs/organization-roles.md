# Système de Rôles d'Organisation

## Vue d'ensemble

Le système de rôles permet de gérer les permissions des utilisateurs au sein d'une organisation. Chaque utilisateur a un rôle spécifique qui détermine ses droits d'accès et d'action.

## Rôles disponibles

### OWNER

- **Description** : Propriétaire de l'organisation
- **Attribution** : Automatique lors de la création d'une organisation
- **Permissions** :
  - Toutes les permissions (lecture, écriture, modification, suppression)
  - Peut modifier et supprimer l'organisation
  - Peut modifier et supprimer tous les événements
  - Peut gérer les membres (changer les rôles, inviter, exclure)
  - Peut créer des tâches dans les événements

### ADMIN

- **Description** : Administrateur de l'organisation
- **Attribution** : Manuelle par un OWNER
- **Permissions** :
  - Peut modifier l'organisation (sauf suppression)
  - Peut modifier les événements (sauf suppression)
  - Peut gérer les membres (changer les rôles, inviter, exclure)
  - Peut créer des tâches dans les événements

### MEMBER

- **Description** : Membre standard de l'organisation
- **Attribution** : Automatique lors de l'acceptation d'une invitation
- **Permissions** :
  - Peut consulter l'organisation et ses événements
  - Peut créer des tâches dans les événements
  - **Ne peut pas** modifier ou supprimer l'organisation
  - **Ne peut pas** modifier ou supprimer les événements

## Hiérarchie des rôles

```
OWNER (3) > ADMIN (2) > MEMBER (1)
```

Les rôles suivent une hiérarchie où les rôles supérieurs héritent des permissions des rôles inférieurs.

## Modèles de données

### OrganizationMember

```prisma
model OrganizationMember {
  id             Int      @id @default(autoincrement())
  userUid        String
  organizationId Int
  role           OrganizationRole @default(MEMBER)
  createdAt      DateTime @default(now())

  user          User          @relation(fields: [userUid], references: [uid], onDelete: Cascade)
  organization  Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userUid])
}
```

### OrganizationRole (Enum)

```prisma
enum OrganizationRole {
  OWNER
  ADMIN
  MEMBER
}
```

## Fonctions utilitaires

### Vérification des rôles

```typescript
// Vérifier si un utilisateur a un rôle spécifique
await hasOrganizationRole(userUid, organizationId, "ADMIN");

// Vérifier les permissions de modification
await canModifyOrganization(userUid, organizationId);
await canModifyEvent(userUid, organizationId);

// Vérifier les permissions de suppression
await canDeleteOrganization(userUid, organizationId);
await canDeleteEvent(userUid, organizationId);

// Récupérer le rôle d'un utilisateur
await getUserOrganizationRole(userUid, organizationId);
```

### Hook React pour les permissions

```typescript
const {
  userRole,
  loading,
  fetchUserRole,
  canModify,
  canDelete,
  canModifyEvent,
  canDeleteEvent,
} = useOrganizationPermissions();
```

## API Routes

### GET /api/user/organizations/[id]/role

Récupère le rôle d'un utilisateur dans une organisation.

**Réponse :**

```json
{
  "success": true,
  "role": "OWNER" | "ADMIN" | "MEMBER"
}
```

## Logique métier

### Création d'organisation

Lorsqu'un utilisateur crée une organisation :

1. L'organisation est créée avec l'utilisateur comme propriétaire
2. Une entrée `OrganizationMember` est créée avec le rôle `OWNER`
3. L'utilisateur est ajouté à la liste des membres de l'organisation

### Rejoindre une organisation

Lorsqu'un utilisateur rejoint une organisation via invitation :

1. L'invitation est marquée comme acceptée
2. Une entrée `OrganizationMember` est créée avec le rôle `MEMBER`
3. Le compteur de membres de l'organisation est incrémenté

### Gestion des permissions dans l'interface

Les boutons d'action sont conditionnellement affichés selon le rôle :

```tsx
{
  canModifyEvent && (
    <Button onClick={() => router.push(`/dashboard/events/edit/${slug}`)}>
      Modifier l'événement
    </Button>
  );
}

{
  canDeleteEvent && (
    <Button
      variant="destructive"
      onClick={() => router.push(`/dashboard/events/delete/${slug}`)}
    >
      Supprimer l'événement
    </Button>
  );
}
```

## Migration des données

### Script de migration

Le script `scripts/migrate-organization-roles.js` met à jour les anciennes données :

1. Identifie les propriétaires d'organisations
2. Met à jour leurs rôles vers `OWNER`
3. Conserve les rôles `ADMIN` existants
4. Met à jour tous les autres rôles vers `MEMBER`

### Exécution

```bash
node scripts/migrate-organization-roles.js
```

### Script de test

Le script `scripts/test-organization-roles.js` vérifie l'intégrité du système :

1. Vérifie que chaque organisation a exactement un propriétaire
2. Teste les permissions selon les rôles
3. Affiche un rapport détaillé

### Exécution

```bash
node scripts/test-organization-roles.js
```

## Sécurité

### Vérifications côté serveur

Toutes les opérations sensibles vérifient les permissions :

```typescript
// Exemple pour la modification d'un événement
const canModify = await canModifyEvent(user.uid, event.orgId);
if (!canModify) {
  return NextResponse.json(
    { error: "Permissions insuffisantes" },
    { status: 403 }
  );
}
```

### Contraintes de base de données

- Un utilisateur ne peut avoir qu'un seul rôle par organisation
- Les suppressions en cascade sont configurées pour maintenir l'intégrité

## Évolutions futures

### Fonctionnalités prévues

1. **Gestion des rôles** : Interface pour changer les rôles des membres
2. **Rôles personnalisés** : Création de rôles avec permissions personnalisées
3. **Audit trail** : Historique des changements de rôles
4. **Permissions granulaires** : Permissions spécifiques par fonctionnalité

### Considérations techniques

- Les rôles sont stockés dans la base de données pour la performance
- Les vérifications de permissions sont mises en cache côté client
- Le système est extensible pour de nouveaux rôles et permissions
