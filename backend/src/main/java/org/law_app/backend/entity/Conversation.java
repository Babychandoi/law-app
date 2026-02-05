package org.law_app.backend.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
public class Conversation {
    @Id
    private String id;

    private String guestId;
    private String guestName;
    private boolean isOnline;
    private Date lastSeen;
    private String assignedAdmin;
    private String priority;
    private Date createdAt;
    private Date updatedAt;
    private Integer unreadCount;
}
