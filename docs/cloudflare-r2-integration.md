# Intégration Cloudflare R2 pour l'upload d'images

## Vue d'ensemble

Ce document décrit l'intégration de Cloudflare R2 pour le stockage distant des images dans l'application Teamify. Cette solution remplace le stockage local des images par un stockage cloud sécurisé et performant.

## Configuration requise

### Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
R2_ACCESS_KEY_ID=votre_access_key_id
R2_SECRET_ACCESS_KEY=votre_secret_access_key
R2_ENDPOINT=https://votre_account_id.r2.cloudflarestorage.com
R2_BUCKET=nom_de_votre_bucket
```

### Dépendances

Le package `@aws-sdk/client-s3` est requis pour l'intégration :

```bash
pnpm add @aws-sdk/client-s3
```

## Architecture

### 1. API Route d'upload (`/api/upload/route.ts`)

**Fonctionnalités :**

- Validation des types de fichiers (JPEG, PNG, WebP)
- Validation de la taille (max 10MB)
- Upload sécurisé vers Cloudflare R2
- Génération d'URLs publiques
- Gestion d'erreurs complète

**Utilisation :**

```typescript
const formData = new FormData();
formData.append("file", imageFile);
formData.append("type", "organization" | "event");

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});
```

### 2. Utilitaire d'upload (`/lib/upload-utils.ts`)

**Fonctions principales :**

- `uploadImage(file, type)` : Upload d'une image
- `validateImageFile(file, maxSize)` : Validation côté client

**Types :**

```typescript
interface UploadResponse {
  success: boolean;
  url: string;
  fileName: string;
}
```

### 3. Composant CloudflareImageUpload

**Fonctionnalités :**

- Interface drag & drop
- Prévisualisation d'image
- Validation en temps réel
- Gestion d'état d'upload
- Support responsive

**Props :**

```typescript
interface CloudflareImageUploadProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  type: "organization" | "event";
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
  currentImageUrl?: string | null;
}
```

## Intégration dans les formulaires

### Création d'organisation

**Avant :**

```typescript
// Stockage local
const file = formData.get("file") as File;
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const fileName = `${Date.now()}-${file.name}`;
const path = join(process.cwd(), "public/uploads/organizations", fileName);
await writeFile(path, buffer);
const profileImage = `/uploads/organizations/${fileName}`;
```

**Après :**

```typescript
// Upload Cloudflare R2
const imageUrl = formData.get("imageUrl") as string;
const profileImage = imageUrl; // URL publique Cloudflare
```

### Création d'événement

**Avant :**

```typescript
// Stockage local
const file = formData.get("file") as File;
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const fileName = `${Date.now()}-${file.name}`;
const path = join(
  process.cwd(),
  "public/uploads/organizations/events",
  fileName
);
await writeFile(path, buffer);
const imageUrl = `/uploads/organizations/events/${fileName}`;
```

**Après :**

```typescript
// Upload Cloudflare R2
const imageUrl = formData.get("imageUrl") as string;
// imageUrl contient l'URL publique Cloudflare
```

## Modifications des types

### StepProps (types/steps.ts)

```typescript
export interface StepProps {
  // ... autres champs
  formData: {
    // ... autres champs
    file?: File;
    imageUrl?: string; // Nouveau champ
  };
}
```

### EventFormData (types/steps-event-creation.ts)

```typescript
export interface EventFormData {
  // ... autres champs
  image?: File;
  imageUrl?: string; // Nouveau champ
}
```

## Sécurité

### Validation des fichiers

- Types autorisés : JPEG, PNG, WebP
- Taille maximale : 10MB
- Validation côté client et serveur

### Authentification

- Tous les uploads nécessitent une authentification
- Vérification des permissions utilisateur

### URLs sécurisées

- URLs publiques générées automatiquement
- Cache configuré pour 1 an
- Pas d'exposition des clés d'API

## Performance

### Optimisations

- Upload direct vers Cloudflare R2
- Pas de stockage temporaire local
- URLs publiques avec cache CDN
- Compression automatique des images

### Monitoring

- Logs d'erreurs détaillés
- Gestion des timeouts
- Retry automatique en cas d'échec

## Migration

### Étapes de migration

1. Configuration des variables d'environnement
2. Installation des dépendances
3. Déploiement des nouvelles API routes
4. Mise à jour des composants frontend
5. Test des fonctionnalités d'upload

### Rétrocompatibilité

- Les anciennes images locales restent accessibles
- Migration progressive possible
- Pas de breaking changes pour les utilisateurs

## Dépannage

### Erreurs courantes

**"Non autorisé" (401)**

- Vérifier l'authentification utilisateur
- Contrôler les variables d'environnement R2

**"Type de fichier non supporté" (400)**

- Vérifier le format de l'image
- S'assurer que le fichier est bien une image

**"Fichier trop volumineux" (400)**

- Réduire la taille de l'image
- Vérifier la limite configurée (10MB par défaut)

**"Erreur lors de l'upload" (500)**

- Vérifier la connectivité Cloudflare R2
- Contrôler les logs serveur
- Vérifier les permissions du bucket

### Logs utiles

```bash
# Vérifier les logs d'upload
tail -f logs/upload.log

# Tester la connectivité R2
curl -I $R2_ENDPOINT/$R2_BUCKET/
```

## Maintenance

### Nettoyage

- Les anciens fichiers locaux peuvent être supprimés après migration
- Monitoring de l'espace de stockage R2
- Archivage des images inutilisées

### Sauvegarde

- Configuration automatique des sauvegardes R2
- Rétention des images selon la politique de l'organisation

### Monitoring

- Métriques d'upload (volume, erreurs, performance)
- Alertes en cas de problème
- Dashboard de monitoring R2
