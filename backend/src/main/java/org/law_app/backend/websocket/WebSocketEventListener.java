package org.law_app.backend.websocket;

import org.law_app.backend.dto.StatusUpdate;
import org.law_app.backend.dto.response.ChatStatsResponse;
import org.law_app.backend.repository.ChatMessageRepository;
import org.law_app.backend.repository.ConversationRepository;
import org.law_app.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ChatService chatService;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet(); // Thread-safe set to track online users

    @Autowired
    public WebSocketEventListener(SimpMessagingTemplate simpMessagingTemplate, ChatService chatService,
                                  ConversationRepository conversationRepository, ChatMessageRepository chatMessageRepository) {
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.chatService = chatService;
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    private String extractUserId(SessionConnectEvent event) {
        String userId = event.getMessage().getHeaders().get("simpUser") != null
                ? ((UserPrincipal) event.getMessage().getHeaders().get("simpUser")).getName()
                : null;
        System.out.println("Extracted userId from connect event: " + userId); // Debug log
        return userId;
    }

    private String extractUserId(SessionDisconnectEvent event) {
        String userId = event.getMessage().getHeaders().get("simpUser") != null
                ? ((UserPrincipal) event.getMessage().getHeaders().get("simpUser")).getName()
                : null;
        System.out.println("Extracted userId from disconnect event: " + userId); // Debug log
        return userId;
    }

    private String extractAdminId(SessionConnectEvent event) {
        String adminId = (String) event.getMessage().getHeaders().get("adminId");
        System.out.println("Extracted adminId from connect event: " + adminId); // Debug log
        return adminId != null ? adminId : "admin-001"; // Fallback to default adminId
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        String userId = extractUserId(event);
        String adminId = extractAdminId(event);
        System.out.println("WebSocket connect event for userId: " + userId);
        if (userId != null) {
            onlineUsers.add(userId);
            chatService.updateGuestOnlineStatus(userId, true);
            simpMessagingTemplate.convertAndSend("/topic/admin/user-status", new StatusUpdate(userId, true));
            sendStatsUpdate(adminId);
        } else {
            // Chỉ log warning thay vì gửi error message đến client
            System.err.println("Warning: Missing userId in CONNECT event - this might be a guest user");
            // Có thể tạo temporary userId cho guest nếu cần:
            // String tempUserId = "guest-" + System.currentTimeMillis();
            // System.out.println("Created temporary userId for guest: " + tempUserId);
            // onlineUsers.add(tempUserId);
            // sendStatsUpdate(adminId);

            // KHÔNG GỬI ERROR MESSAGE NỮA:
            // simpMessagingTemplate.convertAndSend("/topic/errors", "Missing userId in CONNECT event");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String userId = extractUserId(event);
        String adminId = (String) event.getMessage().getHeaders().get("adminId");
        adminId = adminId != null ? adminId : "admin-001"; // Fallback to default adminId
        System.out.println("WebSocket disconnect event for userId: " + userId);
        if (userId != null) {
            onlineUsers.remove(userId);
            chatService.updateGuestOnlineStatus(userId, false);
            simpMessagingTemplate.convertAndSend("/topic/admin/user-status", new StatusUpdate(userId, false));
            sendStatsUpdate(adminId);
        }
    }

    private void sendStatsUpdate(String adminId) {
        Date today = Date.from(LocalDateTime.now().withHour(0).withMinute(0).withSecond(0)
                .atZone(ZoneId.systemDefault()).toInstant());
        ChatStatsResponse stats = ChatStatsResponse.builder()
                .onlineUsers(onlineUsers.size())
                .totalConversations(conversationRepository.count())
                .unreadConversations(conversationRepository.findAllUnreadConversations().size())
                .assignedToAdmin(conversationRepository.findByAssignedAdmin(adminId).size())
                .todayMessages(chatMessageRepository.findMessagesSinceDate(today).size())
                .build();
        simpMessagingTemplate.convertAndSend("/topic/admin/stats", stats);
        System.out.println("Sent stats update: onlineUsers=" + stats.getOnlineUsers());
    }
}