package org.law_app.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.SenderType;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    String id;
    String guestId;
    String content;
    SenderType senderType;
    Date createdAt;
    String adminId;
    boolean isRead;
}