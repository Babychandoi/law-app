package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Hero {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String title;
    String subtitle;
    String description;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    ChildrenServices service;

}
