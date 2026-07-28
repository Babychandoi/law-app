package org.law_app.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.time.Instant;
import java.util.List;
import org.law_app.chat.domain.ConversationType;
import org.law_app.chat.domain.MessageType;

/** Request/response DTOs for the staff-chat REST + WS API, grouped for brevity. */
public final class Dtos {

  private Dtos() {}

  // ---------- Requests ----------

  public record CreateDirectRequest(@NotBlank String targetUserId) {}

  public record CreateGroupRequest(
      @NotBlank String name, @NotEmpty List<String> memberIds, ConversationType type) {}

  public record AddMemberRequest(@NotBlank String userId) {}

  public record LinkRequest(String customerId, String customerServiceId) {}

  public record SendMessageRequest(
      @NotBlank String conversationId,
      String content,
      MessageType type,
      List<AttachmentDto> attachments) {}

  public record TypingRequest(@NotBlank String conversationId) {}

  // ---------- Responses ----------

  public record AttachmentDto(String url, String name, String mime, long size) {}

  public record ConversationSummary(
      String id,
      ConversationType type,
      String name,
      String createdBy,
      List<String> memberIds,
      String linkedCustomerId,
      String linkedCustomerServiceId,
      LastMessageDto lastMessage,
      int unreadCount,
      Instant updatedAt) {}

  public record LastMessageDto(String content, String senderId, Instant at) {}

  public record MessageDto(
      String id,
      String conversationId,
      String senderId,
      String content,
      MessageType type,
      List<AttachmentDto> attachments,
      List<String> readBy,
      Instant createdAt,
      Instant editedAt) {}

  /**
   * Pushed over /user/queue/staff.inbox to bump badges and surface new conversations. Carries
   * senderId + preview so the client can notify (toast/sound/browser) without opening the chat.
   */
  public record InboxEvent(
      String type, String conversationId, int unreadCount, String senderId, String preview) {}

  public record PresenceEvent(String userId, boolean online) {}
}
