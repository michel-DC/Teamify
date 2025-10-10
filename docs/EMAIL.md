# 📧 Services d'Email - Teamify

Ce dossier contient tous les services d'envoi d'email de l'application Teamify, organisés de manière modulaire et réutilisable.

## 🏗️ Architecture

```
/emails
├── services/           # Services d'envoi d'email
│   ├── event-invitation.service.ts
│   ├── organization-invitation.service.ts
│   └── index.ts
├── templates/          # Templates HTML des emails
│   ├── base-template.html.ts
│   ├── event-invitation.html.ts
│   └── organization-invitation.html.ts
├── types/             # Types TypeScript
│   └── email.types.ts
└── README.md          # Cette documentation
```

## 🚀 Utilisation

### 1. Import des services

```typescript
import {
  EventInvitationService,
  OrganizationInvitationService,
} from "@/emails/services";
```

### 2. Envoi d'une invitation d'événement

```typescript
const emailData = {
  eventName: "Mon événement",
  eventCategory: "Conférence",
  eventDate: "2024-01-15",
  eventLocation: "Paris",
  participantsCount: 50,
  description: "Description de l'événement",
  invitationCode: "ABC123",
};

const result = await EventInvitationService.sendInvitation(
  "user@example.com",
  "Nom Utilisateur",
  emailData
);

if (result.success) {
  console.log("Email envoyé avec succès");
} else {
  console.error("Erreur:", result.error);
}
```

### 3. Envoi d'une invitation d'organisation

```typescript
const emailData = {
  organizationName: "Mon Organisation",
  organizationType: "ASSOCIATION",
  memberCount: 25,
  mission: "Notre mission",
  bio: "Description de l'organisation",
  inviteCode: "XYZ789",
  inviterName: "Nom Invitant",
};

const result = await OrganizationInvitationService.sendInvitation(
  "user@example.com",
  "Nom Utilisateur",
  emailData
);
```

## 🎨 Templates

### Template de base

Le `base-template.html.ts` fournit :

- Styles CSS communs
- Header avec logo Teamify
- Footer avec mentions légales
- Structure HTML responsive

### Templates spécifiques

Chaque type d'email a son propre template qui étend le template de base :

- `event-invitation.html.ts` : Invitations aux événements
- `organization-invitation.html.ts` : Invitations aux organisations

## 🔧 Configuration

### Variables d'environnement requises

```env
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Personnalisation

Pour modifier l'apparence des emails :

1. Éditez les styles dans `base-template.html.ts`
2. Modifiez la structure dans les templates spécifiques
3. Ajustez les couleurs et la typographie selon votre charte graphique

## 📝 Ajout d'un nouveau type d'email

### 1. Créer le type dans `types/email.types.ts`

```typescript
export interface NewEmailData {
  // Propriétés spécifiques
}
```

### 2. Créer le template dans `templates/`

```typescript
export const generateNewEmail = (data: NewEmailData): string => {
  // Logique de génération du HTML
};
```

### 3. Créer le service dans `services/`

```typescript
export class NewEmailService {
  static async sendEmail(
    email: string,
    data: NewEmailData
  ): Promise<EmailServiceResponse> {
    // Logique d'envoi
  }
}
```

### 4. Exporter dans `services/index.ts`

```typescript
export { NewEmailService } from "./new-email.service";
```

## 🧪 Tests

Les services d'email peuvent être testés indépendamment :

- Tests unitaires des templates
- Tests d'intégration avec Resend
- Tests de validation des données

## 🔒 Sécurité

- Validation des données d'entrée
- Gestion des erreurs centralisée
- Logs d'erreur sans exposition de données sensibles
- Rate limiting recommandé au niveau des routes API

## 📚 Dépendances

- `resend` : Service d'envoi d'email
- `@/lib/prisma` : Base de données
- `@/lib/auth` : Authentification

## 🤝 Contribution

Pour ajouter de nouveaux types d'email :

1. Suivre la structure existante
2. Utiliser le template de base
3. Ajouter les types appropriés
4. Tester l'envoi
5. Documenter les changements
