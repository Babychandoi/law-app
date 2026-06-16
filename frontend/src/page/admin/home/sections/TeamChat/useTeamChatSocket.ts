import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { InboxEvent, TeamMessage } from '../../../../../types/teamChat';

const WS_URL = process.env.REACT_APP_STAFF_WS_URL as string;

type ConnState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

interface Handlers {
  onMessage?: (msg: TeamMessage) => void;
  onTyping?: (userId: string) => void;
  onInbox?: (event: InboxEvent) => void;
  onPresence?: (userId: string, online: boolean) => void;
}

/**
 * Single STOMP connection to the staff-chat service (through the gateway). Auth is the
 * sessionStorage access token, sent in the CONNECT Authorization header and verified by the
 * service's CONNECT interceptor.
 */
export function useTeamChatSocket(handlers: Handlers) {
  const clientRef = useRef<Client | null>(null);
  const convSubRef = useRef<{ id: string; unsub: () => void } | null>(null);
  const [state, setState] = useState<ConnState>('DISCONNECTED');
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    setState('CONNECTING');
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setState('CONNECTED');
        // Per-user inbox (badges, new conversations)
        client.subscribe('/user/queue/staff/inbox', (m: IMessage) => {
          handlersRef.current.onInbox?.(JSON.parse(m.body));
        });
        // Presence broadcast
        client.subscribe('/topic/staff/presence', (m: IMessage) => {
          const e = JSON.parse(m.body);
          handlersRef.current.onPresence?.(e.userId, e.online);
        });
      },
      onDisconnect: () => setState('DISCONNECTED'),
      onStompError: () => setState('DISCONNECTED'),
    });

    client.activate();
    clientRef.current = client;
    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, []);

  /** Subscribe to a conversation topic, replacing any previous one. */
  const subscribeConversation = useCallback((conversationId: string) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    if (convSubRef.current?.id === conversationId) return;
    convSubRef.current?.unsub();
    const sub = client.subscribe(`/topic/staff/conv/${conversationId}`, (m: IMessage) => {
      const body = JSON.parse(m.body);
      if (body.event === 'TYPING') {
        handlersRef.current.onTyping?.(body.userId);
      } else {
        handlersRef.current.onMessage?.(body as TeamMessage);
      }
    });
    convSubRef.current = { id: conversationId, unsub: () => sub.unsubscribe() };
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string, type = 'TEXT', attachments: unknown[] = []) => {
      clientRef.current?.publish({
        destination: '/app/staff.send',
        body: JSON.stringify({ conversationId, content, type, attachments }),
      });
    },
    []
  );

  const sendTyping = useCallback((conversationId: string) => {
    clientRef.current?.publish({
      destination: '/app/staff.typing',
      body: JSON.stringify({ conversationId }),
    });
  }, []);

  return { state, subscribeConversation, sendMessage, sendTyping };
}
