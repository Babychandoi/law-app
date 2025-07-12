package org.law_app.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {
    String id; // Unique identifier for the notification
    String customerServiceName; // Name of the customer service associated with this notification
    String serviceName; // Name of the service associated with this notification
    Date createdAt; // Timestamp when the notification was created
    String userId; // Unique identifier for the user associated with this notification
    Boolean read;
}
