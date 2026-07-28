package org.law_app.backend.entity;

import java.util.Date;
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
@Document(collection = "conversations")
public class Conversation {
  @Id private String id;

  @Indexed(unique = true)
  private String guestId;

  private String guestName;
  private boolean isOnline;
  private Date lastSeen;
  @Indexed private String assignedAdmin;
  @Indexed private String priority;
  private Date createdAt;
  @Indexed private Date updatedAt;
  @Indexed private Integer unreadCount;
}
