package org.law_app.chat.domain;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "staff_conversations")
public class Conversation {

  @Id private String id;

  private ConversationType type;

  /** Name for GROUP/CHANNEL. Null for DIRECT (derived from the other member on the client). */
  private String name;

  private String createdBy;

  /**
   * Deterministic key for DIRECT conversations ("sorted-userIdA:userIdB") to prevent duplicate 1-1
   * rooms. Null for GROUP/CHANNEL.
   */
  @Indexed(unique = true, sparse = true)
  private String directKey;

  private LastMessage lastMessage;

  /** Optional link to a CRM customer / case discussed in this conversation. */
  private String linkedCustomerId;

  private String linkedCustomerServiceId;

  private Instant createdAt;

  @Indexed private Instant updatedAt;

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class LastMessage {
    private String content;
    private String senderId;
    private Instant at;
  }
}
