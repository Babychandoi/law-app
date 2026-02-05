package org.law_app.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.StatusUpdate;
import org.law_app.backend.dto.request.ChatRequest;
import org.law_app.backend.dto.response.ChatMessageResponse;
import org.law_app.backend.dto.response.ChatStatsResponse;
import org.law_app.backend.dto.response.ConversationResponse;
import org.law_app.backend.entity.ChatMessage;
import org.law_app.backend.entity.Conversation;
import org.law_app.backend.repository.ChatMessageRepository;
import org.law_app.backend.repository.ConversationRepository;
import org.law_app.backend.service.ChatService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class ChatServiceImpl implements ChatService {
    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    SimpMessagingTemplate messagingTemplate;
    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet(); // Track online users

    @Override
    public ChatMessage saveMessage(ChatRequest chatRequest) {
        try {
            ChatMessage message = ChatMessage.builder()
                    .guestId(chatRequest.getGuestId())
                    .content(chatRequest.getContent())
                    .senderType(chatRequest.getSenderType())
                    .createdAt(new Date())
                    .adminId(chatRequest.getAdminId())
                    .isRead(false)
                    .status("sent")
                    .build();

            ChatMessage savedMessage = chatMessageRepository.save(message);

            updateOrCreateConversation(chatRequest.getGuestId(), savedMessage);

            return savedMessage;
        } catch (Exception e) {
            log.error("Error saving chat message: {}", e.getMessage());
            throw new RuntimeException("Failed to save message", e);
        }
    }

    @Override
    public List<ChatMessageResponse> getMessagesByGuestId(String guestId) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findByGuestIdOrderByCreatedAtAsc(guestId);
            return messages.stream()
                    .map(this::convertToMessageResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving chat messages for guestId {}: {}", guestId, e.getMessage());
            throw new RuntimeException("Failed to retrieve messages", e);
        }
    }

    @Override
    public List<ConversationResponse> getAllConversations() {
        try {
            List<Conversation> conversations = conversationRepository.findAllByOrderByUpdatedAtDesc();
            return conversations.stream()
                    .map(this::convertToConversationResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving all conversations: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve conversations", e);
        }
    }

    @Override
    public List<ConversationResponse> getConversationsByAdmin(String adminId) {
        try {
            List<Conversation> conversations = conversationRepository.findByAssignedAdmin(adminId);
            return conversations.stream()
                    .map(this::convertToConversationResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving conversations for admin {}: {}", adminId, e.getMessage());
            throw new RuntimeException("Failed to retrieve admin conversations", e);
        }
    }

    @Override
    public List<ConversationResponse> getUnreadConversations() {
        try {
            List<Conversation> conversations = conversationRepository.findAllUnreadConversations();
            return conversations.stream()
                    .map(this::convertToConversationResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving unread conversations: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve unread conversations", e);
        }
    }

    @Override
    public ChatStatsResponse getChatStats(String adminId) {
        try {
            long totalConversations = conversationRepository.count();
            long unreadConversations = conversationRepository.findAllUnreadConversations().size();
            long assignedToAdmin = conversationRepository.findByAssignedAdmin(adminId).size();
            long onlineUsers = this.onlineUsers.size(); // Use in-memory tracking
            Date today = Date.from(LocalDateTime.now().withHour(0).withMinute(0).withSecond(0)
                    .atZone(ZoneId.systemDefault()).toInstant());
            long todayMessages = chatMessageRepository.findMessagesSinceDate(today).size();

            return ChatStatsResponse.builder()
                    .totalConversations(totalConversations)
                    .unreadConversations(unreadConversations)
                    .assignedToAdmin(assignedToAdmin)
                    .onlineUsers(onlineUsers)
                    .todayMessages(todayMessages)
                    .build();
        } catch (Exception e) {
            log.error("Error getting chat stats for admin {}: {}", adminId, e.getMessage());
            throw new RuntimeException("Failed to get chat stats", e);
        }
    }

    public void addOnlineUser(String userId) {
        if (userId != null) {
            onlineUsers.add(userId);
            log.info("Added user to onlineUsers: {}", userId);
        }
    }

    public void removeOnlineUser(String userId) {
        if (userId != null) {
            onlineUsers.remove(userId);
            log.info("Removed user from onlineUsers: {}", userId);
        }
    }

    public ChatStatsResponse getStatsForWebSocket(String adminId) {
        try {
            long totalConversations = conversationRepository.count();
            long unreadConversations = conversationRepository.findAllUnreadConversations().size();
            long assignedToAdmin = conversationRepository.findByAssignedAdmin(adminId).size();
            long onlineUsers = this.onlineUsers.size();
            Date today = Date.from(LocalDateTime.now().withHour(0).withMinute(0).withSecond(0)
                    .atZone(ZoneId.systemDefault()).toInstant());
            long todayMessages = chatMessageRepository.findMessagesSinceDate(today).size();

            return ChatStatsResponse.builder()
                    .totalConversations(totalConversations)
                    .unreadConversations(unreadConversations)
                    .assignedToAdmin(assignedToAdmin)
                    .onlineUsers(onlineUsers)
                    .todayMessages(todayMessages)
                    .build();
        } catch (Exception e) {
            log.error("Error getting stats for WebSocket for admin {}: {}", adminId, e.getMessage());
            throw new RuntimeException("Failed to get WebSocket stats", e);
        }
    }

    @Override
    public void markMessageAsRead(String messageId) {
        try {
            Optional<ChatMessage> messageOpt = chatMessageRepository.findById(messageId);
            if (messageOpt.isPresent()) {
                ChatMessage message = messageOpt.get();
                message.setRead(true);
                chatMessageRepository.save(message);
            }
        } catch (Exception e) {
            log.error("Error marking message as read {}: {}", messageId, e.getMessage());
            throw new RuntimeException("Failed to mark message as read", e);
        }
    }

    @Override
    public void markConversationAsRead(String guestId) {
        try {
            List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessagesByGuestId(guestId);
            unreadMessages.forEach(message -> message.setRead(true));
            chatMessageRepository.saveAll(unreadMessages);

            Optional<Conversation> conversationOpt = conversationRepository.findByGuestId(guestId);
            if (conversationOpt.isPresent()) {
                Conversation conversation = conversationOpt.get();
                conversation.setUnreadCount(0);
                conversation.setUpdatedAt(new Date());
                conversationRepository.save(conversation);
            }
        } catch (Exception e) {
            log.error("Error marking conversation as read for guestId {}: {}", guestId, e.getMessage());
            throw new RuntimeException("Failed to mark conversation as read", e);
        }
    }

    @Override
    public void assignConversationToAdmin(String guestId, String adminId) {
        try {
            Optional<Conversation> conversationOpt = conversationRepository.findByGuestId(guestId);
            if (conversationOpt.isPresent()) {
                Conversation conversation = conversationOpt.get();
                conversation.setAssignedAdmin(adminId);
                conversation.setUpdatedAt(new Date());
                conversationRepository.save(conversation);
            }
        } catch (Exception e) {
            log.error("Error assigning conversation to admin {} for guestId {}: {}", adminId, guestId, e.getMessage());
            throw new RuntimeException("Failed to assign conversation", e);
        }
    }

    @Override
    public void updateConversationPriority(String guestId, String priority) {
        try {
            Optional<Conversation> conversationOpt = conversationRepository.findByGuestId(guestId);
            if (conversationOpt.isPresent()) {
                Conversation conversation = conversationOpt.get();
                conversation.setPriority(priority);
                conversation.setUpdatedAt(new Date());
                conversationRepository.save(conversation);
            }
        } catch (Exception e) {
            log.error("Error updating conversation priority for guestId {}: {}", guestId, e.getMessage());
            throw new RuntimeException("Failed to update conversation priority", e);
        }
    }

    @Override
    public void updateGuestOnlineStatus(String guestId, boolean isOnline) {
        try {
            Optional<Conversation> conversationOpt = conversationRepository.findByGuestId(guestId);
            if (conversationOpt.isPresent()) {
                Conversation conversation = conversationOpt.get();
                conversation.setOnline(isOnline);
                if (!isOnline) {
                    conversation.setLastSeen(new Date());
                }
                conversation.setUpdatedAt(new Date());
                conversationRepository.save(conversation);

                // Notify via WebSocket
                messagingTemplate.convertAndSend("/topic/admin/user-status",
                        new StatusUpdate(guestId, isOnline));
            }
            // Update in-memory online users
            if (isOnline) {
                addOnlineUser(guestId);
            } else {
                removeOnlineUser(guestId);
            }
        } catch (Exception e) {
            log.error("Error updating guest online status for guestId {}: {}", guestId, e.getMessage());
            throw new RuntimeException("Failed to update guest online status", e);
        }
    }

    @Override
    public void updateGuestName(String guestId, String name) {
        try {
            Optional<Conversation> conversationOpt = conversationRepository.findByGuestId(guestId);
            if (conversationOpt.isPresent()) {
                Conversation conversation = conversationOpt.get();
                conversation.setGuestName(name);
                conversation.setUpdatedAt(new Date());
                conversationRepository.save(conversation);
                log.info("Updated guest name for {}: {}", guestId, name);
            } else {
                log.warn("Conversation not found for guestId: {}", guestId);
            }
        } catch (Exception e) {
            log.error("Error updating guest name for guestId {}: {}", guestId, e.getMessage());
            throw new RuntimeException("Failed to update guest name", e);
        }
    }

    @Override
    public ConversationResponse getOrCreateConversation(String guestId) {
        try {
            Optional<Conversation> conversationOpt = conversationRepository.findByGuestId(guestId);
            Conversation conversation;

            if (conversationOpt.isPresent()) {
                conversation = conversationOpt.get();
            } else {
                conversation = Conversation.builder()
                        .guestId(guestId)
                        .guestName("Khách hàng " + guestId.substring(guestId.length() - 4))
                        .isOnline(true)
                        .priority("normal")
                        .createdAt(new Date())
                        .updatedAt(new Date())
                        .unreadCount(0)
                        .build();
                conversation = conversationRepository.save(conversation);
                // Notify new conversation creation
                messagingTemplate.convertAndSend("/topic/admin/user-status",
                        new StatusUpdate(guestId, true));
                addOnlineUser(guestId); // Add to in-memory tracking
            }

            return convertToConversationResponse(conversation);
        } catch (Exception e) {
            log.error("Error getting or creating conversation for guestId {}: {}", guestId, e.getMessage());
            throw new RuntimeException("Failed to get or create conversation", e);
        }
    }

    private void updateOrCreateConversation(String guestId, ChatMessage message) {
        Optional<Conversation> conversationOpt = conversationRepository.findByGuestId(guestId);
        Conversation conversation;

        if (conversationOpt.isPresent()) {
            conversation = conversationOpt.get();
            if (message.getSenderType().toString().equals("GUEST")) {
                conversation.setUnreadCount(conversation.getUnreadCount() + 1);
            }
        } else {
            conversation = Conversation.builder()
                    .guestId(guestId)
                    .guestName("Khách hàng " + guestId.substring(guestId.length() - 4))
                    .isOnline(true)
                    .priority("normal")
                    .createdAt(new Date())
                    .unreadCount(message.getSenderType().toString().equals("GUEST") ? 1 : 0)
                    .build();
            conversation = conversationRepository.save(conversation);
            // Notify new conversation creation
            messagingTemplate.convertAndSend("/topic/admin/user-status",
                    new StatusUpdate(guestId, true));
            addOnlineUser(guestId); // Add to in-memory tracking
        }

        conversation.setUpdatedAt(new Date());
        conversationRepository.save(conversation);
    }

    private ConversationResponse convertToConversationResponse(Conversation conversation) {
        ChatMessage lastMessage = chatMessageRepository.findTopByGuestIdOrderByCreatedAtDesc(conversation.getGuestId());

        return ConversationResponse.builder()
                .guestId(conversation.getGuestId())
                .guestName(conversation.getGuestName())
                .lastMessage(lastMessage != null ? convertToMessageResponse(lastMessage) : null)
                .unreadCount(conversation.getUnreadCount())
                .isOnline(conversation.isOnline())
                .lastSeen(conversation.getLastSeen())
                .assignedAdmin(conversation.getAssignedAdmin())
                .priority(conversation.getPriority())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    private ChatMessageResponse convertToMessageResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .guestId(message.getGuestId())
                .content(message.getContent())
                .senderType(message.getSenderType())
                .createdAt(message.getCreatedAt())
                .adminId(message.getAdminId())
                .isRead(message.isRead())
                .build();
    }
}