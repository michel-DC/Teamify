# 🗂️ Gestion de Persistance des Données - Teamify

## 📋 Résumé

Nouvelle fonctionnalité ajoutée à l'application Teamify pour gérer automatiquement la persistance des données selon la navigation de l'utilisateur.

## ✨ Fonctionnalités

### 🔄 Vidage automatique

- **Surveillance de l'URL** : Vérifie automatiquement si l'URL contient le segment "dashboard"
- **Vidage intelligent** : Vide les données si l'utilisateur quitte la section dashboard
- **Préservation de l'auth** : Conserve les cookies d'authentification par défaut

### 🛡️ Sécurité

- **Gestion d'erreurs** : Traitement gracieux des erreurs de stockage
- **Cookies protégés** : Préservation des cookies d'authentification
- **Logs de débogage** : Affichage des logs en mode développement

## 🏗️ Architecture

### Composants créés

1. **`DataPersistenceManager`** (`src/components/data-persistence-manager.tsx`)

   - Composant principal de gestion
   - Intégré automatiquement dans les layouts
   - Fonctionnement transparent

2. **`useDataPersistence`** (`src/hooks/useDataPersistence.ts`)

   - Hook personnalisé pour utilisation avancée
   - Options configurables
   - Retour d'informations utiles

3. **Utilitaires** (`src/lib/data-persistence-utils.ts`)
   - Fonctions de débogage et test
   - Vérification de l'état des données
   - Outils de développement

### Intégration

```tsx
// Layout principal
src/app/layout.tsx
├── DataPersistenceManager (global)

// Layout dashboard
src/app/dashboard/layout.tsx
├── DataPersistenceManager (spécifique)
```

## 📊 Données gérées

### Stores Zustand

- ✅ `sidebar-storage` - Données de la sidebar
- ✅ `organizations-storage` - Données des organisations
- ✅ `events-storage` - Données des événements
- ✅ `tasks-storage` - Données des tâches

### Stockage local

- ✅ **localStorage** - Clés de persistance des stores
- ✅ **sessionStorage** - Complètement vidé
- ✅ **Cookies** - Cookies de données (sauf auth)

## 🚀 Utilisation

### Automatique (recommandé)

Le système fonctionne automatiquement sans configuration :

```tsx
// Déjà intégré dans les layouts
<DataPersistenceManager />
```

### Manuel (avancé)

Pour une utilisation personnalisée :

```tsx
import { useDataPersistence } from "@/hooks/useDataPersistence";

function MonComposant() {
  const { clearPersistedData, isInRequiredSection } = useDataPersistence({
    requiredPathSegment: "dashboard",
    clearAuthCookies: false,
    debug: true,
  });

  return (
    <div>
      <p>Dans dashboard: {isInRequiredSection ? "Oui" : "Non"}</p>
      <button onClick={clearPersistedData}>Vider manuellement</button>
    </div>
  );
}
```

## 🧪 Tests et débogage

### Utilitaires disponibles

```tsx
import {
  logPersistedDataStatus,
  testDataPersistence,
  getPersistedDataStatus,
} from "@/lib/data-persistence-utils";

// Afficher l'état actuel
logPersistedDataStatus();

// Tester le vidage
testDataPersistence();

// Obtenir l'état
const status = getPersistedDataStatus();
```

### Console de développement

En mode développement, les logs sont automatiquement affichés :

- URL actuelle
- Segment requis
- Actions de vidage
- Erreurs éventuelles

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers

- `src/components/data-persistence-manager.tsx`
- `src/hooks/useDataPersistence.ts`
- `src/lib/data-persistence-utils.ts`
- `src/components/examples/data-persistence-example.tsx`
- `docs/data-persistence.md`

### Fichiers modifiés

- `src/app/layout.tsx` - Ajout du DataPersistenceManager
- `src/app/dashboard/layout.tsx` - Ajout du DataPersistenceManager

## 🔧 Configuration

### Options disponibles

| Option                | Type      | Défaut        | Description               |
| --------------------- | --------- | ------------- | ------------------------- |
| `requiredPathSegment` | `string`  | `"dashboard"` | Segment d'URL requis      |
| `clearAuthCookies`    | `boolean` | `false`       | Vidage des cookies d'auth |
| `debug`               | `boolean` | `false`       | Logs de débogage          |

### Variables d'environnement

- `NODE_ENV=development` : Active automatiquement les logs de débogage

## 🎯 Cas d'usage

### Scénario typique

1. Utilisateur sur `/dashboard/events` → Données conservées
2. Navigation vers `/auth/login` → Données vidées automatiquement
3. Retour sur `/dashboard` → Données rechargées depuis le serveur

### Avantages

- **Performance** : Évite l'accumulation de données obsolètes
- **Sécurité** : Nettoyage automatique des données sensibles
- **UX** : Expérience utilisateur cohérente
- **Maintenance** : Gestion centralisée de la persistance

## 🔮 Évolutions futures

### Fonctionnalités prévues

- [ ] Support de segments multiples
- [ ] Règles de persistance personnalisées
- [ ] Métriques de performance
- [ ] Interface d'administration

### Extensibilité

Le système est conçu pour être facilement extensible :

- Ajout de nouveaux stores
- Nouvelles règles de persistance
- Intégration avec d'autres systèmes

## 📞 Support

Pour toute question ou problème :

1. Consulter la documentation complète : `docs/data-persistence.md`
2. Utiliser les utilitaires de débogage
3. Vérifier les logs de la console en mode développement

---

**Développé avec ❤️ pour Teamify**
