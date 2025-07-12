package org.law_app.backend.redis;

import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(@NotNull WebSocketSession session) {
        String userId = getUserIdFromSession(session);
        if (userId != null) userSessions.put(userId, session);
    }

    @Override
    public void afterConnectionClosed(@NotNull WebSocketSession session, @NotNull CloseStatus status) {
        String userId = getUserIdFromSession(session);
        if (userId != null) userSessions.remove(userId);
    }

    public void sendToUser(String userId, String message) throws IOException {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }

    private String getUserIdFromSession(WebSocketSession session) {
        return session.getUri().getQuery().split("=")[1];
    }
}