package org.law_app.backend.dto.response;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationMessage {
    String id;
    String userId;
    String title;
    String content;
    String type;
    String link;
    String referenceId;
    // Legacy fields for backward compatibility
    String customerServiceName;
    String serviceName;
    Date createdAt;
    Boolean read;
}
