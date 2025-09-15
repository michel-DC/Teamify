# Implémentation Socket.IO Compatible Vercel

## Vue d'ensemble

Cette implémentation permet d'utiliser Socket.IO avec Vercel en utilisant uniquement le polling (pas de WebSockets) pour la compatibilité avec les fonctions serverless.

## Architecture

### 1. Configuration Socket.IO (`src/lib/socket-vercel.ts`)

- Configuration optimisée pour Vercel
- Utilise uniquement le transport `polling`
- Types TypeScript pour les événements

### 2. Hook Client (`src/hooks/useSocketVercel.ts`)

- Hook React pour gérer la connexion Socket.IO
- Compatible avec les fonctions serverless
- Gestion des événements de messagerie

### 3. API Route (`src/app/api/socket-io/route.ts`)

- Gestionnaire pour les requêtes Socket.IO
- Simulation des réponses Socket.IO
- Traitement des événements de messagerie

### 4. Configuration Vercel (`vercel.json`)

- Rewrites pour rediriger `/socket.io/*` vers `/api/socket-io`
- Configuration des fonctions serverless

## Fonctionnalités

### ✅ Implémentées

- [x] Configuration Socket.IO compatible Vercel
- [x] Hook client avec gestion des événements
- [x] API route pour traiter les requêtes Socket.IO
- [x] Rewrites Vercel pour la redirection
- [x] Intégration dans le composant ConversationView
- [x] Composant de test pour vérifier la connexion

### 🔄 Limitations

- Utilise uniquement le polling (plus lent que WebSockets)
- Pas de connexion persistante (limitation des fonctions serverless)
- Stockage en mémoire limité par les contraintes Vercel

## Utilisation

### 1. Dans un composant React

```tsx
import { useSocketVercel } from "@/hooks/useSocketVercel";

const MyComponent = () => {
  const { isConnected, sendMessage, joinConversation, leaveConversation } =
    useSocketVercel({
      currentUserId: "user123",
      onMessage: (message) => {
        console.log("Nouveau message:", message);
      },
      onError: (error) => {
        console.error("Erreur Socket.IO:", error);
      },
    });

  // Utilisation...
};
```

### 2. Test de la connexion

```bash
# Test de l'API
curl "http://localhost:3000/api/test-socket?test=connection"
curl "http://localhost:3000/api/test-socket?test=ping"
```

## Configuration

### Variables d'environnement

Aucune variable d'environnement supplémentaire n'est requise pour cette implémentation.

### Déploiement Vercel

1. Assurez-vous que `vercel.json` contient les rewrites
2. Déployez normalement avec `vercel deploy`
3. Les requêtes `/socket.io/*` seront automatiquement redirigées

## Dépannage

### Problèmes courants

1. **Connexion échoue**

   - Vérifiez que l'API route `/api/socket-io` fonctionne
   - Vérifiez les logs Vercel pour les erreurs

2. **Messages non reçus**

   - Vérifiez que le polling est activé
   - Vérifiez les logs du navigateur

3. **Erreurs de déploiement**
   - Vérifiez que `vercel.json` contient les rewrites
   - Vérifiez que les API routes sont correctement configurées

### Logs utiles

```javascript
// Dans le navigateur
console.log("Socket.IO connecté:", isConnected);

// Dans l'API route
console.log("Requête Socket.IO reçue:", request.url);
```

## Alternatives

Si cette implémentation ne répond pas à vos besoins, considérez :

1. **Pusher** - Service de messagerie en temps réel
2. **Ably** - Service de messagerie en temps réel
3. **Server Socket.IO persistant** - Serveur dédié pour Socket.IO

## Performance

- **Polling** : Plus lent que WebSockets mais compatible Vercel
- **Latence** : 1-2 secondes selon la fréquence de polling
- **Bande passante** : Plus élevée que WebSockets

## Sécurité

- Authentification via le hook `useAuth`
- Validation des données côté API
- Gestion des erreurs appropriée

## Maintenance

- Surveillez les logs Vercel pour les erreurs
- Testez régulièrement la connexion
- Mettez à jour les dépendances Socket.IO
