package org.law_app.document.domain;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/** Append-only audit event. Metadata must contain identifiers and state, never field values/PII. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_audit_events")
@CompoundIndex(
    name = "idx_audit_entity_created",
    def = "{'entityType': 1, 'entityId': 1, 'createdAt': -1}")
@CompoundIndex(name = "idx_audit_actor_created", def = "{'actorUserId': 1, 'createdAt': -1}")
public class DocumentAuditEvent {
  @Id private String id;
  private String entityType;
  private String entityId;
  private String action;
  private String actorUserId;
  private String fromStatus;
  private String toStatus;
  @Builder.Default private Map<String, String> metadata = new LinkedHashMap<>();
  @CreatedDate private Instant createdAt;
}
