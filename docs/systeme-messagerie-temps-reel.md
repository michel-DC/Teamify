# Système de Messagerie en Temps Réel - Teamify

## Vue d'ensemble

Le système de messagerie de Teamify est une solution complète de communication en temps réel basée sur Socket.IO, intégrée dans une architecture Next.js moderne. Cette fonctionnalité permet aux utilisateurs de communiquer instantanément au sein d'organisations, de groupes d'événements, ou en conversations privées, offrant une expérience utilisateur fluide et réactive.

## Architecture Générale

### Technologies Utilisées

- **Socket.IO** : Framework principal pour la communication en temps réel
- **Next.js 14** : Framework React avec App Router
- **Prisma** : ORM pour la gestion de base de données
- **PostgreSQL** : Base de données relationnelle
- **TypeScript** : Typage statique pour la robustesse du code
- **Tailwind CSS** : Framework CSS pour l'interface utilisateur

### Architecture en Couches

Le système de messagerie suit une architecture en couches bien définie :

1. **Couche Présentation** : Composants React pour l'interface utilisateur
2. **Couche Logique Métier** : Hooks personnalisés et gestion d'état
3. **Couche API** : Endpoints REST pour les opérations CRUD
4. **Couche Temps Réel** : Serveur Socket.IO pour la communication instantanée
5. **Couche Données** : Base de données PostgreSQL avec Prisma ORM

## Modèle de Données

### Schéma de Base de Données

Le système de messagerie repose sur quatre modèles principaux dans la base de données :

#### 1. Conversation

```typescript
model Conversation {
  id             String           @id @default(cuid())
  type           ConversationType // PRIVATE ou GROUP
  title          String?         // Titre optionnel pour les groupes
  organizationId Int?            // ID de l'organisation (optionnel)
  createdAt      DateTime        @default(now())

  members      ConversationMember[]
  messages     Message[]
  organization Organization?     @relation(fields: [organizationId], references: [id])
}
```

#### 2. ConversationMember

```typescript
model ConversationMember {
  id             String     @id @default(cuid())
  conversationId String
  userId         String
  role           MemberRole // MEMBER ou ADMIN
  joinedAt       DateTime   @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
  user         User         @relation(fields: [userId], references: [uid])

  @@unique([conversationId, userId])
}
```

#### 3. Message

```typescript
model Message {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  attachments    Json?    // Support pour les pièces jointes
  createdAt      DateTime @default(now())

  conversation Conversation     @relation(fields: [conversationId], references: [id])
  sender       User             @relation(fields: [senderId], references: [uid])
  receipts     MessageReceipt[]

  @@index([conversationId, createdAt]) // Index pour optimiser les requêtes
}
```

#### 4. MessageReceipt

```typescript
model MessageReceipt {
  id        String        @id @default(cuid())
  messageId String
  userId    String
  status    ReceiptStatus // DELIVERED ou READ
  timestamp DateTime      @default(now())

  message Message @relation(fields: [messageId], references: [id])
  user    User    @relation(fields: [userId], references: [uid])

  @@unique([messageId, userId])
}
```

### Types et Enums

Le système utilise plusieurs enums pour maintenir la cohérence des données :

- **ConversationType** : PRIVATE, GROUP
- **MemberRole** : MEMBER, ADMIN
- **ReceiptStatus** : DELIVERED, READ

## Serveur Socket.IO

### Configuration et Initialisation

Le serveur Socket.IO est configuré dans `src/lib/socket.ts` avec une architecture robuste :

```typescript
export function initializeSocketIO(httpServer?: NetServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_APP_URL
          : "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Middleware d'authentification
  io.use(async (socket, next) => {
    // Vérification du token JWT
    // Validation de l'utilisateur en base
  });

  return io;
}
```

### Authentification et Sécurité

Le système implémente une authentification robuste au niveau Socket.IO :

1. **Vérification du Token JWT** : Chaque connexion doit fournir un token valide
2. **Validation Utilisateur** : Vérification de l'existence de l'utilisateur en base
3. **Gestion des Erreurs** : Rejet des connexions non autorisées

### Gestion des Connexions

Lorsqu'un utilisateur se connecte :

1. **Rejoindre la Room Utilisateur** : `socket.join(\`user:${userId}\`)`
2. **Chargement des Conversations** : Récupération de toutes les conversations de l'utilisateur
3. **Rejoindre les Rooms de Conversation** : `socket.join(\`conversation:${conversationId}\`)`

### Événements Socket.IO

#### Événements Client vers Serveur

- **`message:send`** : Envoi d'un nouveau message
- **`conversation:join`** : Rejoindre une conversation
- **`conversation:leave`** : Quitter une conversation
- **`message:read`** : Marquer un message comme lu

#### Événements Serveur vers Client

- **`message:new`** : Nouveau message reçu
- **`message:read`** : Confirmation de lecture d'un message
- **`conversation:joined`** : Confirmation de participation à une conversation
- **`error`** : Gestion des erreurs

## Hooks Personnalisés

### useSocket Hook

Le hook `useSocket` centralise toute la logique de communication Socket.IO :

```typescript
export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    autoConnect = true,
    currentUserId,
    onMessage,
    onMessageRead,
    onConversationJoined,
    onError,
  } = options;

  // Gestion de l'état de connexion
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonctions principales
  const connect = useCallback(() => {
    /* ... */
  });
  const disconnect = useCallback(() => {
    /* ... */
  });
  const sendMessage = useCallback(() => {
    /* ... */
  });
  const joinConversation = useCallback(() => {
    /* ... */
  });
  const leaveConversation = useCallback(() => {
    /* ... */
  });

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessageAsRead,
  };
};
```

### useMessages Hook

Gère l'état local des messages avec optimisations :

```typescript
export const useMessages = (options: UseMessagesOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gestion des messages optimistes
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Logique de remplacement des messages optimistes
      // par les vrais messages du serveur
    });
  }, []);

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    addMessage,
    updateMessage,
    removeMessage,
  };
};
```

### useConversations Hook

Gère les conversations avec toutes les opérations CRUD :

```typescript
export const useConversations = (options: UseConversationsOptions = {}) => {
  // État des conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Opérations CRUD
  const fetchConversations = useCallback(() => {
    /* ... */
  });
  const createConversation = useCallback(() => {
    /* ... */
  });
  const addMemberToConversation = useCallback(() => {
    /* ... */
  });
  const removeMemberFromConversation = useCallback(() => {
    /* ... */
  });
  const updateConversation = useCallback(() => {
    /* ... */
  });
  const deleteConversation = useCallback(() => {
    /* ... */
  });

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    createConversation,
    addMemberToConversation,
    removeMemberFromConversation,
    updateConversation,
    deleteConversation,
    fetchMessages,
  };
};
```

## Composants React

### Architecture des Composants

Le système de messagerie utilise une architecture de composants modulaire :

```
messaging/
├── chat-interface.tsx          # Interface principale
├── conversation-sidebar.tsx    # Liste des conversations
├── conversation-view.tsx       # Vue d'une conversation
├── message-list.tsx           # Liste des messages
└── create-conversation-dialog.tsx # Dialog de création
```

### ChatInterface - Composant Principal

Le composant `ChatInterface` orchestre toute l'interface de messagerie :

```typescript
export const ChatInterface = ({
  conversations = [],
  onConversationSelect,
  selectedConversationId,
}: ChatInterfaceProps) => {
  // Hooks pour la gestion d'état
  const { checkAuth } = useAuth();
  const { isConnected, sendMessage, joinConversation, leaveConversation } =
    useSocket({
      onMessage: (message) => {
        setMessages((prev) => [...prev, message]);
        // Marquer automatiquement comme lu
        if (message.conversationId === selectedConversationId) {
          markMessageAsRead(message.id);
        }
      },
    });

  // Gestion des messages
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Liste des conversations */}
      <ConversationSidebar />

      {/* Zone de chat */}
      <ConversationView />
    </div>
  );
};
```

### ConversationView - Vue de Conversation

Gère l'affichage et l'interaction avec une conversation spécifique :

```typescript
export const ConversationView = ({
  conversationId,
  conversation,
  user,
  onBackToConversations,
}: ConversationViewProps) => {
  // Hooks pour les messages et Socket.IO
  const { messages, addMessage } = useMessages({
    conversationId,
    autoFetch: true,
  });
  const { isConnected, sendMessage, joinConversation, leaveConversation } =
    useSocket({
      currentUserId: user?.uid,
      onMessage: (message) => addMessage(message),
    });

  // Rejoindre la conversation automatiquement
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
    }
    return () => {
      if (conversationId && isConnected) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, isConnected]);

  return (
    <div className="flex flex-col h-full">
      {/* En-tête de conversation */}
      <ConversationHeader />

      {/* Liste des messages */}
      <MessageList messages={messages} currentUserId={user?.uid} />

      {/* Zone de saisie */}
      <MessageInput />
    </div>
  );
};
```

### MessageList - Affichage des Messages

Composant optimisé pour l'affichage des messages avec scroll automatique et fonctionnalités de suppression :

```typescript
export const MessageList = ({
  messages,
  currentUserId,
  isLoading,
  onDeleteMessage,
}: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }, 0);
      }
    }
  }, [messages]);

  // Gestion de la suppression d'un message
  const handleDeleteMessage = async (messageId: string) => {
    if (!onDeleteMessage) return;

    try {
      const success = await onDeleteMessage(messageId);
      if (success) {
        toast.success("Message supprimé avec succès");
      } else {
        toast.error("Erreur lors de la suppression du message");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du message");
    }
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full">
      <div className="p-3 md:p-4 space-y-3">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;

          return (
            <div
              key={message.id}
              className={`flex group ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`flex flex-col w-64 md:w-80 relative`}>
                {/* Bulle de message */}
                <div
                  className={`rounded-lg px-3 py-2 text-sm min-h-[40px] flex items-center ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words w-full">
                    {message.content}
                  </p>
                </div>

                {/* Heure et menu d'options */}
                <div
                  className={`flex items-center justify-between mt-1 ${
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <p
                    className={`text-xs text-muted-foreground ${
                      isCurrentUser ? "text-right" : "text-left"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>

                  {/* Menu d'options pour les messages de l'utilisateur */}
                  {isCurrentUser && onDeleteMessage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
```

## API REST

### Endpoints de Conversations

#### GET /api/conversations

Récupère toutes les conversations de l'utilisateur connecté :

```typescript
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: { userId: user.uid },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              uid: true,
              firstname: true,
              lastname: true,
              profileImage: true,
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ conversations: formattedConversations });
}
```

#### POST /api/conversations

Crée une nouvelle conversation :

```typescript
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const { type, title, memberIds, organizationId } = await req.json();

  // Validation des données
  if (!type || !memberIds || !Array.isArray(memberIds)) {
    return NextResponse.json(
      { error: "Type et membres requis" },
      { status: 400 }
    );
  }

  // Vérification que tous les membres existent
  const existingUsers = await prisma.user.findMany({
    where: { uid: { in: memberIds } },
    select: { uid: true },
  });

  if (existingUsers.length !== memberIds.length) {
    return NextResponse.json(
      { error: "Un ou plusieurs utilisateurs n'existent pas" },
      { status: 400 }
    );
  }

  // Création de la conversation
  const conversation = await prisma.conversation.create({
    data: {
      type,
      title: title || null,
      organizationId: organizationId ? parseInt(organizationId) : null,
      members: {
        create: memberIds.map((memberId: string) => ({
          userId: memberId,
          role: memberId === user.uid ? "ADMIN" : "MEMBER",
        })),
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              uid: true,
              firstname: true,
              lastname: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
```

### Endpoints de Messages

#### GET /api/conversations/[conversationId]/messages

Récupère les messages d'une conversation :

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const user = await getCurrentUser();

  // Vérification de l'appartenance à la conversation
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.uid,
      },
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Accès refusé à cette conversation" },
      { status: 403 }
    );
  }

  // Récupération des messages
  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          uid: true,
          firstname: true,
          lastname: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}
```

#### POST /api/conversations/[conversationId]/messages

Crée un nouveau message :

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const { content, attachments } = await request.json();
  const user = await getCurrentUser();

  // Validation du contenu
  if (!content || !content.trim()) {
    return NextResponse.json(
      { error: "Le contenu du message est requis" },
      { status: 400 }
    );
  }

  // Vérification de l'appartenance à la conversation
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.uid,
      },
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Accès refusé à cette conversation" },
      { status: 403 }
    );
  }

  // Création du message
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.uid,
      content: content.trim(),
      attachments: attachments || null,
    },
    include: {
      sender: {
        select: {
          uid: true,
          firstname: true,
          lastname: true,
          profileImage: true,
        },
      },
    },
  });

  return NextResponse.json(message);
}
```

#### DELETE /api/conversations/[conversationId]/messages/[messageId]

Supprime un message :

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  const { conversationId, messageId } = await params;
  const user = await getCurrentUser();

  // Vérification de l'authentification
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérification de l'appartenance à la conversation
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.uid,
      },
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Accès refusé à cette conversation" },
      { status: 403 }
    );
  }

  // Vérification que le message existe et appartient à l'utilisateur
  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
      conversationId,
    },
  });

  if (!message) {
    return NextResponse.json({ error: "Message non trouvé" }, { status: 404 });
  }

  if (message.senderId !== user.uid) {
    return NextResponse.json(
      { error: "Vous ne pouvez supprimer que vos propres messages" },
      { status: 403 }
    );
  }

  // Suppression du message
  await prisma.message.delete({
    where: {
      id: messageId,
    },
  });

  return NextResponse.json({ success: true });
}
```

## Flux de Communication

### Envoi d'un Message

1. **Saisie Utilisateur** : L'utilisateur tape un message dans l'interface
2. **Validation Frontend** : Vérification du contenu et de la connexion Socket.IO
3. **Envoi Socket.IO** : Émission de l'événement `message:send`
4. **Traitement Serveur** :
   - Vérification de l'authentification
   - Validation de l'appartenance à la conversation
   - Sauvegarde en base de données
5. **Diffusion** : Envoi du message à tous les membres de la conversation
6. **Mise à jour UI** : Affichage du message dans l'interface

### Réception d'un Message

1. **Réception Socket.IO** : Écoute de l'événement `message:new`
2. **Mise à jour État** : Ajout du message à la liste locale
3. **Affichage** : Rendu du message dans l'interface
4. **Scroll Automatique** : Défilement vers le nouveau message
5. **Marquage Lu** : Marquage automatique si c'est la conversation active

### Suppression d'un Message

1. **Action Utilisateur** : L'utilisateur clique sur le menu d'options d'un de ses messages
2. **Confirmation** : Sélection de l'option "Supprimer" dans le menu déroulant
3. **Validation Frontend** : Vérification que l'utilisateur est l'expéditeur du message
4. **Appel API** : Envoi de la requête DELETE vers l'endpoint de suppression
5. **Traitement Serveur** :
   - Vérification de l'authentification
   - Validation de l'appartenance à la conversation
   - Vérification que l'utilisateur est l'expéditeur du message
   - Suppression du message en base de données
6. **Mise à jour UI** : Suppression du message de la liste locale
7. **Feedback** : Affichage d'une notification de succès ou d'erreur

### Gestion des Connexions

1. **Connexion** : L'utilisateur se connecte au serveur Socket.IO
2. **Authentification** : Vérification du token JWT
3. **Rejoindre Rooms** :
   - Room utilisateur : `user:${userId}`
   - Rooms conversations : `conversation:${conversationId}`
4. **Synchronisation** : Chargement des conversations et messages
5. **Déconnexion** : Nettoyage des rooms et de l'état

## Optimisations et Performances

### Messages Optimistes

Le système implémente des messages optimistes pour améliorer l'expérience utilisateur :

```typescript
const addMessage = useCallback((message: Message) => {
  setMessages((prev) => {
    // Si c'est un message optimiste (ID commence par "temp_"), l'ajouter
    if (message.id.startsWith("temp_")) {
      return [...prev, message];
    }

    // Si c'est un message du serveur, remplacer le message optimiste correspondant
    const hasOptimisticMessage = prev.some(
      (msg) =>
        msg.id.startsWith("temp_") &&
        msg.conversationId === message.conversationId &&
        msg.content === message.content
    );

    if (hasOptimisticMessage) {
      return prev.map((msg) =>
        msg.id.startsWith("temp_") &&
        msg.conversationId === message.conversationId &&
        msg.content === message.content
          ? message
          : msg
      );
    }

    return [...prev, message];
  });
}, []);
```

### Gestion de l'État

- **État Local** : Gestion optimisée avec `useState` et `useCallback`
- **Mémoisation** : Utilisation de `useMemo` pour les calculs coûteux
- **Cleanup** : Nettoyage automatique des listeners et connexions

### Scroll Automatique

```typescript
useEffect(() => {
  if (scrollAreaRef.current) {
    const scrollElement = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollElement) {
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }, 0);
    }
  }
}, [messages]);
```

## Gestion des Erreurs

### Types d'Erreurs

1. **Erreurs de Connexion** : Problèmes de réseau ou serveur
2. **Erreurs d'Authentification** : Token invalide ou expiré
3. **Erreurs de Validation** : Données invalides
4. **Erreurs d'Accès** : Permissions insuffisantes

### Stratégies de Gestion

```typescript
// Gestion des erreurs Socket.IO
socket.on("connect_error", (error) => {
  setError(error.message);
  setIsConnecting(false);
  setIsConnected(false);
});

// Gestion des erreurs API
try {
  const response = await fetch("/api/conversations");
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
} catch (err) {
  console.error("Erreur lors de la récupération des conversations:", err);
  setError(err instanceof Error ? err.message : "Erreur inconnue");
}
```

## Sécurité

### Authentification

- **JWT Tokens** : Authentification basée sur des tokens JWT
- **Validation Serveur** : Vérification systématique des tokens
- **Sessions** : Gestion des sessions utilisateur

### Autorisation

- **Vérification d'Appartenance** : Contrôle d'accès aux conversations
- **Validation des Données** : Sanitisation des entrées utilisateur
- **Rate Limiting** : Protection contre les abus

### Chiffrement

- **HTTPS/WSS** : Communication chiffrée
- **Validation CORS** : Configuration sécurisée des origines
- **Sanitisation** : Nettoyage des données utilisateur

## Tests et Débogage

### Scripts de Test

Le projet inclut des scripts de test pour valider le fonctionnement :

```javascript
// scripts/test/test-realtime-messaging.js
async function testRealtimeMessaging() {
  // Test de connexion Socket.IO
  // Test d'envoi de messages
  // Test de réception de messages
  // Test de gestion des erreurs
}
```

### Logging

```typescript
console.log(`[Socket.IO] 🔌 Utilisateur connecté: ${userId} (${socket.id})`);
console.log(`[Socket.IO] 📨 Message reçu:`, data);
console.log(`[conversations/messages] ${messages.length} messages récupérés`);
```

## Déploiement et Configuration

### Variables d'Environnement

```env
# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Base de données
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="..."
```

### Configuration Production

```typescript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_APP_URL
        : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});
```

## Évolutions Futures

### Fonctionnalités Prévues

1. **Notifications Push** : Intégration avec les notifications navigateur
2. **Messages Éphémères** : Messages qui s'effacent automatiquement
3. **Réactions** : Système de réactions aux messages
4. **Threads** : Conversations en fil de discussion
5. **Recherche** : Recherche dans les messages
6. **Mentions** : Système de mentions d'utilisateurs
7. **Fichiers** : Upload et partage de fichiers
8. **Messages Vocaux** : Enregistrement et envoi de messages vocaux

### Optimisations Techniques

1. **Pagination** : Chargement progressif des messages
2. **Cache** : Mise en cache des conversations fréquentes
3. **Compression** : Compression des messages volumineux
4. **CDN** : Distribution des assets statiques
5. **Monitoring** : Surveillance des performances en temps réel

## Conclusion

Le système de messagerie de Teamify représente une solution complète et moderne pour la communication en temps réel. Son architecture modulaire, sa robustesse et ses optimisations en font un système évolutif capable de s'adapter aux besoins croissants de l'application.

L'utilisation de Socket.IO pour la communication temps réel, combinée à une API REST pour la persistance des données, offre le meilleur des deux mondes : performance et fiabilité. L'architecture en composants React facilite la maintenance et l'évolution du code, tandis que TypeScript assure la robustesse du système.

Cette implémentation constitue une base solide pour développer des fonctionnalités de communication avancées et répondre aux besoins futurs de l'application Teamify.
