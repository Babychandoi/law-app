package org.law_app.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(indexes = {@Index(name = "idx_services_title", columnList = "title")})
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Services {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  String title;
  String href;
  @CreationTimestamp LocalDateTime createdAt;
  @UpdateTimestamp LocalDateTime updatedAt;
}
