package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Color;
import org.law_app.backend.common.Icon;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Important {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id; // Unique identifier for the important entity
    String text; // Text content of the important entity
    String href; // URL or link associated with the important entity
    Icon icon; // Icon associated with the important entity, if applicable
    Color color; // Color associated with the important entity, if applicable
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "company_id")
    Company company; // Reference to the company associated with this important entity
}
