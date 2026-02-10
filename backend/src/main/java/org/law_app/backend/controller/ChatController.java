package org.law_app.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.common.SenderType;
import org.law_app.backend.dto.request.ChatRequest;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.dto.response.ChatMessageResponse;
import org.law_app.backend.dto.response.ChatStatsResponse;
import org.law_app.backend.dto.response.ConversationResponse;
import org.law_app.backend.entity.ChatMessage;
import org.law_app.backend.service.ChatService;
import org.law_app.backend.service.ChatbotAIService;
import org.law_app.backend.service.NotificationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final ChatbotAIService chatbotAIService;

    /**
     * WebSocket endpoint for sending messages
     * Frontend publishes to: /app/chat.sendMessage
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatRequest chatRequest) {
        log.info("Received message from guest: {}", chatRequest.getGuestId());
        
        // Save message to database
        ChatMessage savedMessage = chatService.saveMessage(chatRequest);
        
        // ===== ADMIN TAKEOVER LOGIC =====
        // If message is from ADMIN, disable AI for this conversation
        if ("ADMIN".equals(chatRequest.getSenderType().toString())) {
            chatbotAIService.disableAIForGuest(chatRequest.getGuestId());
            log.info("Admin took over conversation for guest: {}", chatRequest.getGuestId());
        }
        // ===== END ADMIN TAKEOVER LOGIC =====
        
        // Create response
        ChatMessageResponse response = ChatMessageResponse.builder()
                .id(savedMessage.getId())
                .guestId(savedMessage.getGuestId())
                .content(savedMessage.getContent())
                .senderType(savedMessage.getSenderType())
                .createdAt(savedMessage.getCreatedAt())
                .adminId(savedMessage.getAdminId())
                .isRead(savedMessage.isRead())
                .build();
        
        // Send to specific guest topic
        messagingTemplate.convertAndSend("/topic/chat/" + chatRequest.getGuestId(), response);
        
        // Also notify admin dashboard
        messagingTemplate.convertAndSend("/topic/admin/messages", response);
        
        // ===== AI CHATBOT LOGIC =====
        // If message is from guest and AI should respond
        if ("GUEST".equals(chatRequest.getSenderType().toString()) && 
            chatbotAIService.shouldAIRespond(chatRequest.getGuestId())) {
            
            // Generate AI response asynchronously to not block
            CompletableFuture.runAsync(() -> {
                try {
                    String aiResponse = chatbotAIService.generateResponse(
                        chatRequest.getGuestId(), 
                        chatRequest.getContent()
                    );
                    
                    if (aiResponse != null && !aiResponse.isEmpty()) {
                        // Create AI message
                        ChatRequest aiRequest = new ChatRequest();
                        aiRequest.setGuestId(chatRequest.getGuestId());
                        aiRequest.setContent(aiResponse);
                        aiRequest.setSenderType(SenderType.ADMIN); // AI messages are ADMIN type
                        
                        // Save AI message with special admin ID
                        ChatMessage aiMessage = chatService.saveMessage(aiRequest);
                        
                        // Send AI response to guest
                        ChatMessageResponse aiMessageResponse = ChatMessageResponse.builder()
                                .id(aiMessage.getId())
                                .guestId(aiMessage.getGuestId())
                                .content(aiMessage.getContent())
                                .senderType(aiMessage.getSenderType())
                                .createdAt(aiMessage.getCreatedAt())
                                .adminId("AI-BOT")
                                .isRead(false)
                                .build();
                        
                        // Small delay to make it feel more natural
                        Thread.sleep(1500);
                        
                        messagingTemplate.convertAndSend(
                            "/topic/chat/" + chatRequest.getGuestId(), 
                            aiMessageResponse
                        );
                        
                        log.info("AI response sent to guest: {}", chatRequest.getGuestId());
                    }
                } catch (Exception e) {
                    log.error("Error generating AI response: {}", e.getMessage(), e);
                }
            });
        }
        // ===== END AI CHATBOT LOGIC =====
        
        // Create notification for admin if message is from guest
        if ("GUEST".equals(chatRequest.getSenderType().toString())) {
            try {
                notificationService.createChatNotification(
                    chatRequest.getGuestId(), 
                    savedMessage.getContent()
                );
            } catch (Exception e) {
                log.error("Error creating chat notification: {}", e.getMessage());
            }
        }
    }

    /**
     * Get messages for a specific guest conversation
     * GET /chat/{guestId}
     */
    @GetMapping("/{guestId}")
    public List<ChatMessageResponse> getMessages(@PathVariable String guestId) {
        log.info("Fetching messages for guest: {}", guestId);
        return chatService.getMessagesByGuestId(guestId);
    }

    /**
     * Get all conversations for admin
     * GET /chat/admin/conversations
     */
    @GetMapping("/admin/conversations")
    public ApiResponse<List<ConversationResponse>> getAllConversations() {
        log.info("Fetching all conversations for admin");
        List<ConversationResponse> conversations = chatService.getAllConversations();
        return ApiResponse.<List<ConversationResponse>>builder()
                .code(200)
                .message("Success")
                .data(conversations)
                .build();
    }

    /**
     * Get chat statistics for admin
     * GET /chat/admin/stats/{adminId}
     */
    @GetMapping("/admin/stats/{adminId}")
    public ChatStatsResponse getChatStats(@PathVariable String adminId) {
        log.info("Fetching chat stats for admin: {}", adminId);
        return chatService.getChatStats(adminId);
    }

    /**
     * Mark conversation as read
     * PUT /chat/admin/conversations/{guestId}/read
     */
    @PutMapping("/admin/conversations/{guestId}/read")
    public ApiResponse<Void> markConversationAsRead(@PathVariable String guestId) {
        log.info("Marking conversation as read for guest: {}", guestId);
        chatService.markConversationAsRead(guestId);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Conversation marked as read")
                .build();
    }

    /**
     * Assign conversation to admin
     * PUT /chat/admin/conversations/{guestId}/assign/{adminId}
     */
    @PutMapping("/admin/conversations/{guestId}/assign/{adminId}")
    public ApiResponse<Void> assignConversation(
            @PathVariable String guestId,
            @PathVariable String adminId) {
        log.info("Assigning conversation {} to admin: {}", guestId, adminId);
        chatService.assignConversationToAdmin(guestId, adminId);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Conversation assigned successfully")
                .build();
    }

    /**
     * Update conversation priority
     * PUT /chat/admin/conversations/{guestId}/priority/{priority}
     */
    @PutMapping("/admin/conversations/{guestId}/priority/{priority}")
    public ApiResponse<Void> updatePriority(
            @PathVariable String guestId,
            @PathVariable String priority) {
        log.info("Updating priority for conversation {}: {}", guestId, priority);
        chatService.updateConversationPriority(guestId, priority);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Priority updated successfully")
                .build();
    }

    /**
     * Update guest online status
     * PUT /chat/admin/guest/{guestId}/online/{isOnline}
     */
    @PutMapping("/admin/guest/{guestId}/online/{isOnline}")
    public ApiResponse<Void> updateGuestOnlineStatus(
            @PathVariable String guestId,
            @PathVariable boolean isOnline) {
        log.info("Updating online status for guest {}: {}", guestId, isOnline);
        chatService.updateGuestOnlineStatus(guestId, isOnline);
        
        // Notify admin about online status change
        messagingTemplate.convertAndSend("/topic/admin/online-status", 
                new OnlineStatusUpdate(guestId, isOnline));
        
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Online status updated")
                .build();
    }

    /**
     * Update guest name
     * PUT /chat/admin/guest/{guestId}/name
     */
    @PutMapping("/admin/guest/{guestId}/name")
    public ApiResponse<Void> updateGuestName(
            @PathVariable String guestId,
            @RequestParam String name) {
        log.info("Updating name for guest {}: {}", guestId, name);
        chatService.updateGuestName(guestId, name);
        
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Guest name updated successfully")
                .build();
    }

    /**
     * Admin sends message to guest - this disables AI
     * POST /chat/admin/send
     */
    @PostMapping("/admin/send")
    public ApiResponse<ChatMessageResponse> adminSendMessage(@RequestBody ChatRequest chatRequest) {
        log.info("Admin sending message to guest: {}", chatRequest.getGuestId());
        
        // Disable AI when admin takes over
        chatbotAIService.disableAIForGuest(chatRequest.getGuestId());
        
        ChatMessage savedMessage = chatService.saveMessage(chatRequest);
        
        ChatMessageResponse response = ChatMessageResponse.builder()
                .id(savedMessage.getId())
                .guestId(savedMessage.getGuestId())
                .content(savedMessage.getContent())
                .senderType(savedMessage.getSenderType())
                .createdAt(savedMessage.getCreatedAt())
                .adminId(savedMessage.getAdminId())
                .isRead(savedMessage.isRead())
                .build();
        
        // Send to guest via WebSocket
        messagingTemplate.convertAndSend("/topic/chat/" + chatRequest.getGuestId(), response);
        
        return ApiResponse.<ChatMessageResponse>builder()
                .code(200)
                .message("Message sent successfully")
                .data(response)
                .build();
    }
    
    /**
     * Enable AI for a conversation
     * PUT /chat/admin/conversations/{guestId}/enable-ai
     */
    @PutMapping("/admin/conversations/{guestId}/enable-ai")
    public ApiResponse<Void> enableAI(@PathVariable String guestId) {
        log.info("Enabling AI for guest: {}", guestId);
        chatbotAIService.enableAIForGuest(guestId);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("AI enabled for conversation")
                .build();
    }

    /**
     * Disable AI for a conversation
     * PUT /chat/admin/conversations/{guestId}/disable-ai
     */
    @PutMapping("/admin/conversations/{guestId}/disable-ai")
    public ApiResponse<Void> disableAI(@PathVariable String guestId) {
        log.info("Disabling AI for guest: {}", guestId);
        chatbotAIService.disableAIForGuest(guestId);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("AI disabled for conversation")
                .build();
    }

    /**
     * Get or create conversation for guest
     * POST /chat/conversation
     */
    @PostMapping("/conversation")
    public ApiResponse<ConversationResponse> getOrCreateConversation(@RequestParam String guestId) {
        log.info("Get or create conversation for guest: {}", guestId);
        ConversationResponse conversation = chatService.getOrCreateConversation(guestId);
        return ApiResponse.<ConversationResponse>builder()
                .code(200)
                .message("Success")
                .data(conversation)
                .build();
    }

    // Inner class for online status updates
    @lombok.Data
    @lombok.AllArgsConstructor
    private static class OnlineStatusUpdate {
        private String guestId;
        private boolean isOnline;
    }
}
