package org.law_app.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.SenderType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatRequest {
    String guestId;
    String content;
    SenderType senderType;
    String adminId;
}
