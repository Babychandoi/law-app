package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Process {
    @Id
    @GeneratedValue(strategy =  GenerationType.UUID)
    String id;
    String step;
    String title;
    String description;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    ChildrenServices service;
}
