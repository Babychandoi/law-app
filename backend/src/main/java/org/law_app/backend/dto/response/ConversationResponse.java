package org.law_app.backend.dto.response;

import java.util.Date;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationResponse {
  String guestId;
  String guestName;
  ChatMessageResponse lastMessage;
  Integer unreadCount;
  boolean isOnline;
  Date lastSeen;
  String assignedAdmin;
  String priority;
  Date createdAt;
  Date updatedAt;
}
