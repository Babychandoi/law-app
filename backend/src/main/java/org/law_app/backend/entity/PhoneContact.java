package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Color;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhoneContact {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id; // Unique identifier for the phone contact
    String label; // Label for the phone contact (e.g., "Work", "Home")
    String number; // Phone number of the contact
    Color color; // Color associated with the phone contact, if applicable
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "company_id")
    Company company; // Reference to the company associated with this phone contact
}
