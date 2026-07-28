package org.law_app.backend.service;

import java.util.List;
import org.law_app.backend.dto.request.ChatRequest;
import org.law_app.backend.dto.response.ChatMessageResponse;
import org.law_app.backend.dto.response.ChatStatsResponse;
import org.law_app.backend.dto.response.ConversationResponse;
import org.law_app.backend.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatService {
  ChatMessage saveMessage(ChatRequest chatMessage);

  List<ChatMessageResponse> getMessagesByGuestId(String guestId);

  List<ConversationResponse> getAllConversations();

  Page<ConversationResponse> getAllConversations(Pageable pageable);

  List<ConversationResponse> getConversationsByAdmin(String adminId);

  List<ConversationResponse> getUnreadConversations();

  ChatStatsResponse getChatStats(String adminId);

  void markMessageAsRead(String messageId);

  void markConversationAsRead(String guestId);

  void assignConversationToAdmin(String guestId, String adminId);

  void updateConversationPriority(String guestId, String priority);

  void updateGuestOnlineStatus(String guestId, boolean isOnline);

  void updateGuestName(String guestId, String name);

  ConversationResponse getOrCreateConversation(String guestId);
}
