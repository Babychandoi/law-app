package org.law_app.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    indexes = {@Index(name = "idx_customer_subscribe_email", columnList = "email", unique = true)})
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerSubscribe {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  String email;
  @CreationTimestamp LocalDateTime createdAt;
}
