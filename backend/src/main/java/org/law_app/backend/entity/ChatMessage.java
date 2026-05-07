package org.law_app.backend.entity;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.law_app.backend.common.SenderType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_messages")
@CompoundIndexes({
  @CompoundIndex(name = "idx_guest_created_at", def = "{'guestId': 1, 'createdAt': 1}"),
  @CompoundIndex(name = "idx_guest_read", def = "{'guestId': 1, 'isRead': 1}")
})
public class ChatMessage {
  @Id private String id;

  @Indexed private String guestId;
  private String content;
  private SenderType senderType;
  @Indexed private Date createdAt;
  private String adminId;
  private boolean isRead;
  private String status;
}
