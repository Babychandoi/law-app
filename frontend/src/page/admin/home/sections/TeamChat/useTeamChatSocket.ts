import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getWsToken } from '../../../../../service/auth';
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
 * Single STOMP connection to the staff-chat service (through the gateway). Auth is a short-lived
 * ws-token fetched from /auth/ws-token right before connect (the access token is an httpOnly cookie
 * that JS cannot read), sent in the CONNECT Authorization header and verified by the service.
 */
export function useTeamChatSocket(handlers: Handlers) {
  const clientRef = useRef<Client | null>(null);
  const convSubRef = useRef<{ id: string; unsub: () => void } | null>(null);
  const [state, setState] = useState<ConnState>('DISCONNECTED');
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let disposed = false;

    // The ws-token is short-lived and fetched right before each (re)connect. beforeConnect runs
    // again on every STOMP reconnect, so an expired token is automatically replaced.
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: async () => {
        const wsToken = await getWsToken();
        if (wsToken) {
          client.connectHeaders = { Authorization: `Bearer ${wsToken}` };
        }
      },
      onConnect: () => {
        if (disposed) return;
        setState('CONNECTED');
        client.subscribe('/user/queue/staff.inbox', (m: IMessage) => {
          handlersRef.current.onInbox?.(JSON.parse(m.body));
        });
        client.subscribe('/topic/staff.presence', (m: IMessage) => {
          const e = JSON.parse(m.body);
          handlersRef.current.onPresence?.(e.userId, e.online);
        });
      },
      onDisconnect: () => setState('DISCONNECTED'),
      onStompError: () => setState('DISCONNECTED'),
    });

    setState('CONNECTING');
    client.activate();
    clientRef.current = client;
    return () => {
      disposed = true;
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
    const sub = client.subscribe(`/topic/staff.conv.${conversationId}`, (m: IMessage) => {
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
