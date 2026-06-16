package org.law_app.chat.domain;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

/** One row per (conversation, user). Drives a user's inbox and per-user unread/read state. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "staff_memberships")
@CompoundIndexes({
  @CompoundIndex(name = "idx_user_updated", def = "{'userId': 1, 'updatedAt': -1}"),
  @CompoundIndex(
      name = "idx_conv_user_unique",
      def = "{'conversationId': 1, 'userId': 1}",
      unique = true)
})
public class Membership {

  @Id private String id;

  private String conversationId;

  private String userId;

  private MemberRole role;

  private Instant joinedAt;

  private Instant lastReadAt;

  private int unreadCount;

  /** Mirrors the conversation's updatedAt so the inbox can sort by recency per user. */
  private Instant updatedAt;
}
