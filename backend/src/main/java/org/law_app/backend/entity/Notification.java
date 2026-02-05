package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id; // Unique identifier for the notification
    
    String title; // Title of the notification
    
    String content; // Content/message of the notification
    
    String type; // Type of notification: CUSTOMER_SERVICE, CHAT, SYSTEM, etc.
    
    String link; // Link to navigate when notification is clicked
    
    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt; // Timestamp when the notification was created
    
    @ManyToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    CustomerService customerService; // Reference to the customer service (nullable for non-customer-service notifications)
    
    String referenceId; // Generic reference ID (e.g., guestId for chat notifications)
}
