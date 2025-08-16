# Système d'Invitations par Email

## Vue d'ensemble

Le système d'invitations par email permet d'envoyer automatiquement des invitations aux participants d'un événement via l'API Resend.

## Configuration

### Variables d'environnement requises

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Configuration Resend

**Important :** Pour le développement, utilisez l'adresse de test Resend :

```typescript
from: "Teamify <onboarding@resend.dev>";
```

Pour la production, vérifiez votre domaine sur https://resend.com/domains

Voir le guide complet : [Configuration Resend](./resend-setup.md)

### Installation des dépendances

Le package `resend` est déjà installé dans le projet :

```json
{
  "resend": "^6.0.1"
}
```

## Architecture

### API Route

**Fichier :** `src/app/api/events/[slug]/invitations/route.ts`

**Endpoint :** `POST /api/events/{slug}/invitations`

**Fonctionnalités :**

- Validation des données d'entrée
- Envoi d'email via Resend
- Template HTML responsive et professionnel
- Gestion des erreurs

**Paramètres d'entrée :**

```json
{
  "email": "participant@example.com",
  "eventName": "Nom de l'événement",
  "eventDate": "15/01/2024",
  "eventLocation": "Paris, France"
}
```

### Composant Frontend

**Fichier :** `src/components/dashboard/events/details/invitation-table.tsx`

**Fonctionnalités :**

- Interface utilisateur pour saisir les emails
- Validation côté client
- Appel de l'API d'envoi
- Notifications de succès/erreur
- Mise à jour de l'interface en temps réel

## Utilisation

### Dans un composant parent

```tsx
<InvitationTable
  eventId={event.id}
  eventSlug={params.slug}
  eventName={event.title}
  eventDate={formatDate(event.startDate)}
  eventLocation={event.location}
/>
```

### Flux d'utilisation

1. L'utilisateur clique sur "Inviter des participants"
2. Un dialog s'ouvre pour saisir l'email
3. Validation de l'email côté client
4. Appel de l'API `/api/events/{slug}/invitations`
5. Envoi de l'email via Resend
6. Notification de succès
7. Mise à jour de la liste des invitations

## Template Email

L'email envoyé contient :

- Logo et branding Teamify
- Détails de l'événement (nom, date, lieu)
- Bouton d'action pour répondre à l'invitation
- Design responsive et professionnel
- Liens de fallback

## Gestion des erreurs

### Erreurs côté client

- Validation d'email invalide
- Champs manquants
- Erreurs réseau

### Erreurs côté serveur

- Clé API Resend invalide
- Erreurs de template
- Limites d'envoi

## Sécurité

- Validation stricte des emails
- Sanitisation des données
- Gestion des erreurs sans exposition d'informations sensibles
- Rate limiting (à implémenter si nécessaire)

## Tests

Pour tester l'envoi d'emails :

1. Configurez une clé API Resend valide
2. Utilisez un email de test
3. Vérifiez les logs de Resend pour confirmer l'envoi
4. Testez avec différents formats d'email

## Améliorations futures

- [ ] Rate limiting pour éviter le spam
- [ ] Templates d'email personnalisables
- [ ] Suivi des emails ouverts/cliqués
- [ ] Intégration avec la base de données pour persister les invitations
- [ ] Système de rappels automatiques
- [ ] Support multi-langues
