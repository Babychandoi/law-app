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
public class ProcessTimeLine {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String title; // Title of the timeline event
    String description; // Description of the timeline event
    Icon icon; // Icon representing the timeline event
    Color color;
    String duration; // Duration of the timeline event
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    ChildrenServices service; // Service associated with the timeline event
}
