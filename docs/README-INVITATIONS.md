# 🎉 Système d'Invitations Teamify

## ✅ Fonctionnalités Implémentées

### 🔗 Format des liens d'invitation

```
/join-event?code={invitationId}+{eventCode}
```

**Exemple :** `/join-event?code=123+EVT2024001`

### 📧 Envoi d'invitations

- Interface dans le dashboard pour envoyer des invitations
- Email professionnel avec template HTML
- Lien unique pour chaque invitation
- Validation des emails

### 🎯 Réponse aux invitations

- Page publique accessible sans connexion
- Affichage des détails de l'événement
- Boutons pour accepter ou décliner
- Interface responsive et moderne

### 📊 Gestion des invitations

- Dashboard pour suivre les invitations
- Statistiques (total, acceptées, en attente)
- Tableau des invitations avec statuts
- Formulaire d'envoi intégré

## 🚀 Installation et Configuration

### 1. Migration de la base de données

```bash
# Étape 1: Migration avec colonne optionnelle
npx prisma migrate dev --name add_invitation_id_optional

# Étape 2: Mise à jour des invitations existantes
node scripts/update-invitations.js

# Étape 3: Rendre la colonne requise (optionnel)
# Modifier le schéma pour retirer le ? de invitationId
npx prisma migrate dev --name make_invitation_id_required
```

### 2. Variables d'environnement

```env
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Test du système

```bash
node scripts/test-invitation-system.js
```

## 📁 Structure des fichiers

```
src/
├── app/
│   ├── join-event/
│   │   └── page.tsx                    # Page de réponse aux invitations
│   ├── api/
│   │   └── events/
│   │       └── invitations/
│   │           ├── validate/
│   │           │   └── route.ts        # Validation des codes
│   │           └── respond/
│   │               └── route.ts        # Traitement des réponses
│   └── dashboard/
│       └── events/
│           └── invitations/
│               └── page.tsx            # Dashboard des invitations
├── components/
│   └── dashboard/
│       └── events/
│           └── invitation-table.tsx    # Composant de gestion
└── lib/
    └── invitation-utils.ts             # Utilitaires pour les codes

scripts/
├── update-invitations.js               # Mise à jour des données
└── test-invitation-system.js           # Tests du système

docs/
└── invitations-system.md               # Documentation technique
```

## 🔧 APIs disponibles

### Envoi d'invitation

```http
POST /api/events/[slug]/invitations
Content-Type: application/json

{
  "email": "user@example.com",
  "eventName": "Mon événement",
  "eventDate": "2024-01-15",
  "eventLocation": "Paris"
}
```

### Validation de code

```http
GET /api/events/invitations/validate?code=123+EVT001
```

### Réponse à l'invitation

```http
POST /api/events/invitations/respond
Content-Type: application/json

{
  "invitationId": "123+EVT001",
  "status": "ACCEPTED"
}
```

### Récupération des invitations

```http
GET /api/dashboard/events/[slug]/invitations
```

## 🎨 Interface utilisateur

### Page de réponse (`/join-event`)

- Design moderne avec gradient bleu
- Affichage des détails de l'événement
- Boutons d'action clairs
- Responsive design
- États de chargement et d'erreur

### Dashboard des invitations

- Statistiques en temps réel
- Tableau des invitations
- Formulaire d'envoi
- Badges de statut colorés

## 🔒 Sécurité

- ✅ Validation côté serveur des codes
- ✅ Protection contre les réponses multiples
- ✅ Vérification de l'état de l'événement
- ✅ Validation du format des emails
- ✅ Codes d'invitation uniques

## 📧 Template d'email

L'email d'invitation inclut :

- Logo et branding Teamify
- Détails complets de l'événement
- Bouton de réponse avec lien unique
- Lien de fallback
- Design responsive

## 🧪 Tests

Le script de test vérifie :

- Création d'invitation
- Génération de code
- Décodage de code
- Validation d'invitation
- Mise à jour de statut
- Format des liens

## 🚨 Résolution de problèmes

### Erreur de migration Prisma

Si vous obtenez une erreur lors de la migration :

1. Vérifiez que le schéma a `invitationId String?` (optionnel)
2. Exécutez `node scripts/update-invitations.js`
3. Puis rendez la colonne requise

### Email non reçu

- Vérifiez `RESEND_API_KEY`
- Consultez les logs de l'API
- Vérifiez le spam

### Lien d'invitation invalide

- Vérifiez le format : `{invitationId}+{eventCode}`
- Assurez-vous que l'invitation existe
- Vérifiez que l'événement n'est pas annulé

## 📈 Statistiques

Le système permet de suivre :

- Nombre total d'invitations
- Invitations acceptées
- Invitations en attente
- Invitations déclinées
- Taux de réponse

## 🔄 Flux complet

1. **Organisateur** envoie une invitation
2. **Système** génère un code unique
3. **Email** envoyé avec lien `/join-event?code={code}`
4. **Invité** clique sur le lien
5. **Page** affiche les détails de l'événement
6. **Invité** accepte ou décline
7. **Statut** mis à jour en base
8. **Organisateur** voit la réponse dans le dashboard

---

🎉 **Le système d'invitations est maintenant prêt à être utilisé !**
