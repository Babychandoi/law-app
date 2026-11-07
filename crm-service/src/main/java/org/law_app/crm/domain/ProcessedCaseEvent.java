package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Durable inbox marker used to make at-least-once RabbitMQ delivery idempotent. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "crm_inbox_event",
    indexes = {@Index(name = "idx_crm_inbox_processed", columnList = "processed_at")})
public class ProcessedCaseEvent {

  @Id
  @Column(length = 36, nullable = false)
  private String eventId;

  @Column(length = 36)
  private String caseId;

  @Column(length = 120)
  private String routingKey;

  @Column(nullable = false)
  private Instant processedAt;
}
