package org.law_app.chat.domain;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "staff_messages")
@CompoundIndex(name = "idx_conv_created", def = "{'conversationId': 1, 'createdAt': -1}")
public class Message {

  @Id private String id;

  private String conversationId;

  private String senderId;

  private String content;

  private MessageType type;

  private List<Attachment> attachments;

  private List<String> readBy;

  private Instant createdAt;

  private Instant editedAt;

  private Instant deletedAt;

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Attachment {
    private String url;
    private String name;
    private String mime;
    private long size;
  }
}
