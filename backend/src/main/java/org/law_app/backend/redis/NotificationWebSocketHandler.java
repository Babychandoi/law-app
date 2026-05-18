package org.law_app.backend.redis;

import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(@NotNull WebSocketSession session) {
        String userId = getUserIdFromSession(session);
        if (userId != null && !userId.isEmpty()) {
            userSessions.put(userId, session);
            System.out.println("WebSocket connected for user: " + userId);
        }
    }

    @Override
    public void afterConnectionClosed(@NotNull WebSocketSession session, @NotNull CloseStatus status) {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.remove(userId);
            System.out.println("WebSocket disconnected for user: " + userId);
        }
    }

    public void sendToUser(String userId, String message) throws IOException {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }

    private String getUserIdFromSession(WebSocketSession session) {
        try {
            // First try to get from session attributes (set by HandshakeInterceptor)
            Object userIdAttr = session.getAttributes().get("userId");
            if (userIdAttr != null) {
                return userIdAttr.toString();
            }
            
            // Fallback: try to get from URI query params
            URI uri = session.getUri();
            if (uri == null) return null;
            
            String query = uri.getQuery();
            if (query == null || query.isEmpty()) return null;
            
            // Parse query parameters
            String[] params = query.split("&");
            for (String param : params) {
                String[] keyValue = param.split("=");
                if (keyValue.length == 2 && "userId".equals(keyValue[0])) {
                    return keyValue[1];
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error extracting userId from session: " + e.getMessage());
            return null;
        }
    }
}