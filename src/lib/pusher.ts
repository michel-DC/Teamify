import Pusher from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("Pusher client ne peut être utilisé que côté client");
  }

  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      throw new Error("Variables d'environnement Pusher manquantes");
    }

    pusherClient = new PusherClient(key, {
      cluster,
      useTLS: true,
    });
  }

  return pusherClient;
}

export interface PusherMessageEvent {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  conversationId: string;
  timestamp: string;
}

export interface PusherMessageReadEvent {
  messageId: string;
  userId: string;
  conversationId: string;
  timestamp: string;
}

export interface PusherConversationJoinedEvent {
  conversationId: string;
  userId: string;
  timestamp: string;
}

export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any
): Promise<void> {
  try {
    await pusherServer.trigger(channel, event, data);
    console.log(`✅ Événement Pusher déclenché: ${event} sur ${channel}`);
  } catch (error) {
    console.error(`❌ Erreur Pusher:`, error);
    throw error;
  }
}

export async function triggerNewMessage(
  conversationId: string,
  messageData: PusherMessageEvent
): Promise<void> {
  await triggerPusherEvent(
    `conversation-${conversationId}`,
    "new-message",
    messageData
  );
}

export async function triggerMessageRead(
  conversationId: string,
  readData: PusherMessageReadEvent
): Promise<void> {
  await triggerPusherEvent(
    `conversation-${conversationId}`,
    "message-read",
    readData
  );
}

export async function triggerConversationJoined(
  conversationId: string,
  joinData: PusherConversationJoinedEvent
): Promise<void> {
  await triggerPusherEvent(
    `conversation-${conversationId}`,
    "conversation-joined",
    joinData
  );
}
