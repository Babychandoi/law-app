package org.law_app.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Transactional outbox row. Business changes and their integration event are committed in the same
 * MySQL transaction; a retrying dispatcher publishes the row to RabbitMQ afterwards.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "outbox_event",
    // Cột giữ nguyên camelCase (PhysicalNamingStrategyStandardImpl), không phải snake_case —
    // khai báo sai tên thì Hibernate tạo index thất bại dù bảng đã có.
    indexes = {
      @Index(name = "idx_outbox_pending", columnList = "publishedAt,nextAttemptAt,occurredAt"),
      @Index(name = "idx_outbox_aggregate", columnList = "aggregateType,aggregateId,occurredAt")
    })
public class OutboxEvent {

  @Id
  @Column(length = 36, nullable = false)
  private String id;

  @Column(length = 80, nullable = false)
  private String aggregateType;

  @Column(length = 64, nullable = false)
  private String aggregateId;

  @Column(length = 120, nullable = false)
  private String eventType;

  @Column(length = 120, nullable = false)
  private String routingKey;

  // KHÔNG dùng @Lob ở đây. Cặp @Lob + columnDefinition làm Hibernate sinh DDL `LONGTEXT` bị bọc
  // dấu backtick -> create table lỗi cú pháp; còn @Lob một mình lại map String thành tinytext (255
  // byte) -> payload JSON bị chặn với lỗi "Data too long". columnDefinition trần hoạt động đúng,
  // giống Hero.description đang dùng TEXT.
  @Column(nullable = false, columnDefinition = "LONGTEXT")
  private String payload;

  @Column(nullable = false)
  private Instant occurredAt;

  private Instant publishedAt;
  private Instant nextAttemptAt;

  @Builder.Default private int attempts = 0;

  @Column(length = 1000)
  private String lastError;

  @Version private long revision;
}
