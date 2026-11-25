package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "crm_activity",
    indexes = {
      @Index(
          name = "idx_crm_activity_entity_created",
          columnList = "entity_type, entity_id, created_at")
    })
public class CrmActivity {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "entity_type", length = 32, nullable = false)
  private String entityType;

  @Column(name = "entity_id", length = 36, nullable = false)
  private String entityId;

  @Column(name = "activity_type", length = 32, nullable = false)
  private String activityType;

  @Column(length = 500)
  private String title;

  @Column(length = 5000)
  private String content;

  private Instant dueAt;

  private boolean completed;

  @Column(length = 100)
  private String createdBy;

  @Column(length = 255)
  private String createdByName;

  @Column(name = "created_at")
  private Instant createdAt;
}
