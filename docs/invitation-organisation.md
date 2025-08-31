# Système d'Invitations d'Organisation

## Vue d'ensemble

Le système d'invitations permet aux propriétaires et administrateurs d'organisations d'inviter de nouveaux membres à rejoindre leur organisation. Les invitations sont gérées via des codes uniques de 30 caractères et peuvent être traitées par des utilisateurs connectés ou non. Les emails sont envoyés via le service Resend.

## Modèles de données

### OrganizationInvite

```prisma
model OrganizationInvite {
  id             Int      @id @default(autoincrement())
  inviteCode     String   @unique @default(cuid()) // code d'invitation unique de 30 caractères
  email          String
  receiverName   String   // nom extrait de l'email
  status         OrgInviteStatus @default(PENDING) // PENDING | ACCEPTED | DECLINED
  invitedByUid   String
  organizationId Int
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invitedBy      User         @relation("InvitedBy", fields: [invitedByUid], references: [uid], onDelete: Cascade)

  @@unique([organizationId, email])
}
```

### OrganizationMember

```prisma
model OrganizationMember {
  id             Int      @id @default(autoincrement())
  userUid        String
  organizationId Int
  role           String   @default("member")
  createdAt      DateTime @default(now())

  user          User          @relation(fields: [userUid], references: [uid], onDelete: Cascade)
  organization  Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userUid])
}
```

### Enum OrgInviteStatus

```prisma
enum OrgInviteStatus {
  PENDING
  ACCEPTED
  DECLINED
}
```

## API Routes

### POST /api/organizations/invite

Envoie une invitation à un utilisateur via Resend.

**Body:**

```json
{
  "organizationId": 1,
  "email": "user@example.com"
}
```

**Réponse:**

```json
{
  "success": true,
  "message": "Invitation envoyée avec succès",
  "inviteCode": "ABC123DEF456GHI789JKL012MNO345PQR678",
  "data": {
    /* données de réponse Resend */
  }
}
```

**Vérifications:**

- Utilisateur connecté
- Utilisateur est propriétaire ou admin de l'organisation
- Email non déjà invité
- Email non déjà membre
- Validation du format d'email

**Fonctionnalités:**

- Génération d'un code d'invitation de 30 caractères alphanumériques
- Extraction automatique du nom du receveur depuis l'email
- Envoi d'email HTML professionnel via Resend
- Template d'email avec logo, détails de l'organisation et bouton CTA

### GET /api/invite/[code]

Traite une invitation via son code.

**Réponse si utilisateur connecté:**

```json
{
  "success": true,
  "message": "Vous avez rejoint l'organisation avec succès",
  "redirect": true,
  "url": "/dashboard/organizations/1"
}
```

**Réponse si utilisateur non connecté:**

```json
{
  "redirect": true,
  "url": "/auth/register?invite=ABC123DEF456GHI789JKL012MNO345PQR678",
  "message": "Redirection vers l'inscription"
}
```

### GET /api/organizations/[id]/invitations

Récupère les invitations d'une organisation.

**Réponse:**

```json
{
  "success": true,
  "invitations": [
    {
      "id": 1,
      "inviteCode": "ABC123DEF456GHI789JKL012MNO345PQR678",
      "email": "user@example.com",
      "receiverName": "user",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00Z",
      "invitedBy": {
        "firstname": "John",
        "lastname": "Doe",
        "email": "admin@example.com"
      }
    }
  ]
}
```

## Pages Frontend

### /dashboard/organizations/[id]/invitations

Page de gestion des invitations d'une organisation.

**Fonctionnalités:**

- Liste des invitations avec statut
- Formulaire d'envoi de nouvelle invitation
- Affichage des détails (email, nom du receveur, date, invité par)
- Codes d'invitation de 30 caractères visibles pour les invitations en attente

### /invite/[code]

Page de traitement d'invitation.

**Comportements:**

- Si utilisateur connecté : traitement automatique
- Si utilisateur non connecté : redirection vers inscription
- Gestion des erreurs (invitation invalide, déjà traitée)

## Flux utilisateur

### Utilisateur connecté

1. Reçoit un email avec le lien d'invitation
2. Clique sur le lien `/invite/[code]`
3. L'invitation est automatiquement traitée
4. L'utilisateur est ajouté à l'organisation
5. Redirection vers le dashboard de l'organisation

### Utilisateur non connecté

1. Reçoit un email avec le lien d'invitation
2. Clique sur le lien `/invite/[code]`
3. Redirection vers `/auth/register?invite=[code]`
4. Inscription avec le code d'invitation
5. Après inscription, traitement automatique de l'invitation
6. Redirection vers le dashboard de l'organisation

## Sécurité

### Vérifications de permissions

- Seuls les propriétaires et admins peuvent inviter
- Seuls les propriétaires et admins peuvent voir les invitations
- Vérification de l'existence de l'organisation

### Contraintes de données

- Un utilisateur ne peut être membre qu'une seule fois par organisation (`@@unique([organizationId, userUid])`)
- Une invitation unique par email par organisation (`@@unique([organizationId, email])`)
- Codes d'invitation uniques de 30 caractères générés automatiquement

### Gestion des erreurs

- Invitation non trouvée ou invalide
- Invitation déjà traitée
- Utilisateur déjà membre
- Permissions insuffisantes
- Validation du format d'email

## Intégration

### Dans le dashboard

- Lien vers la gestion des invitations dans la navigation
- Affichage du nombre d'invitations en attente
- Intégration avec le système de notifications

### Notifications

- Toast de succès/erreur lors de l'envoi d'invitation
- Confirmation de traitement d'invitation
- Messages d'erreur explicites

## Configuration

### Variables d'environnement

```env
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=https://teamify.onlinemichel.dev
```

### Service d'email

Le système utilise Resend pour l'envoi d'emails :

- Template HTML professionnel
- Responsive design
- Logo et branding Teamify
- Détails de l'organisation
- Bouton d'action clair

## Migration

Pour activer le système :

1. Appliquer la migration Prisma :

```bash
npx prisma migrate dev --name add_organization_invitations
```

2. Générer le client Prisma :

```bash
npx prisma generate
```

3. Décommenter le code de traitement d'invitation dans `/api/auth/register/route.ts`

4. Configurer la clé API Resend dans les variables d'environnement

## Tests

### Scénarios à tester

- Envoi d'invitation par un propriétaire
- Envoi d'invitation par un admin
- Tentative d'envoi par un membre normal (doit échouer)
- Traitement d'invitation par utilisateur connecté
- Traitement d'invitation par utilisateur non connecté
- Tentative de traitement d'invitation invalide
- Tentative de traitement d'invitation déjà traitée
- Inscription avec code d'invitation
- Vérification des contraintes d'unicité
- Validation du format d'email
- Génération de codes d'invitation de 30 caractères
- Envoi d'email via Resend
- Extraction du nom du receveur depuis l'email
