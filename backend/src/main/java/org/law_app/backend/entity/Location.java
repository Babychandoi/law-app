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
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id; // Unique identifier for the location
    String type; // Type of the location (e.g., city, state, country)
    String address; // Address of the location
    Color color; // Color associated with the location, if applicable
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "company_id")
    Company company; // Reference to the company associated with this location
}
