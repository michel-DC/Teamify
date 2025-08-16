# 🔄 Refactorisation de la Table Invitations

## 📋 Vue d'ensemble

Refactorisation complète de la table `Invitation` pour améliorer la gestion des invitations d'événements avec une structure plus claire et des données plus pertinentes.

## 🏗️ Nouvelle Structure

### Ancienne structure

```sql
model Invitation {
  id        Int              @id @default(autoincrement())
  eventId   Int
  userUid   String
  email     String
  status    InvitationStatus @default(PENDING)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  event     Event            @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User             @relation(fields: [userUid], references: [uid], onDelete: Cascade)

  @@unique([eventId, email])
}
```

### Nouvelle structure

```sql
model Invitation {
  id            Int              @id @default(autoincrement())
  eventCode     String
  receiverName  String
  receiverEmail String
  status        InvitationStatus @default(PENDING)
  sentAt        DateTime         @default(now())
  respondedAt   DateTime?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  event         Event            @relation(fields: [eventCode], references: [eventCode], onDelete: Cascade)

  @@unique([eventCode, receiverEmail])
}
```

## 📊 Colonnes détaillées

| Colonne         | Type               | Description                        | Contrainte                       |
| --------------- | ------------------ | ---------------------------------- | -------------------------------- |
| `id`            | `Int`              | Identifiant unique auto-incrémenté | Primary Key                      |
| `eventCode`     | `String`           | Code de l'événement                | Foreign Key vers Event.eventCode |
| `receiverName`  | `String`           | Nom du destinataire                | Obligatoire                      |
| `receiverEmail` | `String`           | Email du destinataire              | Obligatoire                      |
| `status`        | `InvitationStatus` | Statut de l'invitation             | PENDING/ACCEPTED/DECLINED        |
| `sentAt`        | `DateTime`         | Date d'envoi de l'invitation       | Défaut: maintenant               |
| `respondedAt`   | `DateTime?`        | Date de réponse                    | Optionnel                        |
| `createdAt`     | `DateTime`         | Date de création                   | Défaut: maintenant               |
| `updatedAt`     | `DateTime`         | Date de modification               | Auto-mise à jour                 |

## 🔄 Changements apportés

### 1. **Suppression des relations inutiles**

- ❌ Suppression de la relation avec `User` (userUid)
- ✅ Conservation de la relation avec `Event` via `eventCode`

### 2. **Amélioration des données**

- ✅ Ajout du nom du destinataire (`receiverName`)
- ✅ Séparation claire entre nom et email
- ✅ Ajout de `sentAt` pour tracer l'envoi
- ✅ Ajout de `respondedAt` pour tracer les réponses

### 3. **Optimisation des relations**

- ✅ Relation directe avec `Event` via `eventCode`
- ✅ Contrainte unique sur `[eventCode, receiverEmail]`

## 🚀 Migration

### Script de migration

```bash
# Générer le client Prisma avec le nouveau schéma
npx prisma generate

# Exécuter le script de migration
node scripts/migrate-invitations.js
```

### Étapes de migration

1. **Sauvegarde** des données existantes
2. **Suppression** de l'ancienne table
3. **Création** de la nouvelle structure
4. **Migration** des données existantes
5. **Insertion** de données de test

## 📁 Fichiers modifiés

### Schéma Prisma

- `prisma/schema.prisma` - Nouvelle structure du modèle Invitation

### API Routes

- `src/app/api/dashboard/events/[slug]/invitations/route.ts` - Récupération des invitations
- `src/app/api/events/[slug]/invitations/route.ts` - Envoi d'invitations

### Composants

- `src/components/dashboard/events/details/invitation-table.tsx` - Interface utilisateur

### Scripts

- `scripts/migrate-invitations.js` - Script de migration

## 🎯 Avantages

### 1. **Simplicité**

- Structure plus claire et intuitive
- Moins de relations complexes
- Données plus pertinentes

### 2. **Performance**

- Relation directe avec l'événement
- Index optimisés
- Requêtes plus simples

### 3. **Maintenabilité**

- Code plus lisible
- Logique métier simplifiée
- Moins de dépendances

### 4. **Fonctionnalités**

- Traçabilité complète (envoi/réponse)
- Gestion des noms de destinataires
- Prévention des doublons

## 🧪 Tests

### Données de test

Le script de migration insère automatiquement des données de test :

- Alice Martin (acceptée)
- Bob Dupont (en attente)
- Claire Bernard (refusée)

### Validation

- ✅ Contraintes de clé étrangère
- ✅ Contraintes d'unicité
- ✅ Valeurs par défaut
- ✅ Types de données

## 🔧 Utilisation

### Récupération des invitations

```typescript
const invitations = await prisma.invitation.findMany({
  where: { eventCode: "EVENT123" },
  orderBy: { sentAt: "desc" },
});
```

### Création d'une invitation

```typescript
const invitation = await prisma.invitation.create({
  data: {
    eventCode: "EVENT123",
    receiverName: "Jean Dupont",
    receiverEmail: "jean.dupont@example.com",
    status: "PENDING",
  },
});
```

### Mise à jour du statut

```typescript
const updatedInvitation = await prisma.invitation.update({
  where: { id: 1 },
  data: {
    status: "ACCEPTED",
    respondedAt: new Date(),
  },
});
```

## 📞 Support

Pour toute question ou problème :

1. Vérifier les logs de migration
2. Consulter la documentation Prisma
3. Tester avec les données de test
4. Vérifier les contraintes de base de données

---

**Migration réalisée avec ❤️ pour Teamify**
