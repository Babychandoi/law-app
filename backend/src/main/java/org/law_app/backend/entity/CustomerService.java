package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.law_app.backend.common.Status;
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
public class CustomerService {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id; // Unique identifier for the customer service
    String name; // Name of the customer service
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    Customer customer; // Reference to the customer associated with this service
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    ChildrenServices service; // Reference to the service associated with this customer service
    String description; // Additional description or notes about the customer service
    Status status; // Status of the customer service (e.g., active, inactive, pending)
    @CreationTimestamp
    Date createdAt; // Timestamp when the customer service was created
    @UpdateTimestamp
    Date updatedAt; // Timestamp when the customer service was last updated
    Date CompletedAt; // Timestamp when the customer service was completed, if applicable
    Date CanceledAt; // Timestamp when the customer service was canceled, if applicable
}
