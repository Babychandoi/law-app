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
    String title; // Title of the notification
    String content; // Content/message of the notification
    String type; // Type of notification: CUSTOMER_SERVICE, CHAT, SYSTEM, etc.
    String link; // Link to navigate when notification is clicked
    String referenceId; // Generic reference ID (e.g., guestId for chat notifications)
    
    // Legacy fields for backward compatibility with CUSTOMER_SERVICE type
    String customerServiceName; // Name of the customer service associated with this notification
    String serviceName; // Name of the service associated with this notification
    
    Date createdAt; // Timestamp when the notification was created
    String userId; // Unique identifier for the user associated with this notification
    Boolean read;
}
