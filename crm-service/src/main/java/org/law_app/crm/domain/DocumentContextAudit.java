package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

/**
 * Append-only, PII-free evidence that an authorized document context was resolved.
 *
 * <p>The projection itself can contain selected legal facts; this audit record intentionally never
 * contains them. It lets an operator demonstrate who accessed a matter for document automation
 * without turning the audit trail into another sensitive-data store.
 */
@Getter
@NoArgsConstructor
@Immutable
@Entity
@Table(
    name = "crm_document_context_audit",
    indexes = {
      @Index(name = "idx_document_context_audit_case_time", columnList = "case_id, occurred_at")
    })
public class DocumentContextAudit {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "case_id", length = 36, nullable = false, updatable = false)
  private String caseId;

  @Column(name = "actor_user_id", length = 100, nullable = false, updatable = false)
  private String actorUserId;

  @Column(name = "party_count", nullable = false, updatable = false)
  private int partyCount;

  @Column(name = "response_schema_version", nullable = false, updatable = false)
  private int responseSchemaVersion;

  @Column(name = "occurred_at", nullable = false, updatable = false)
  private Instant occurredAt;

  public DocumentContextAudit(
      String caseId,
      String actorUserId,
      int partyCount,
      int responseSchemaVersion,
      Instant occurredAt) {
    this.id = UUID.randomUUID().toString();
    this.caseId = caseId;
    this.actorUserId = actorUserId;
    this.partyCount = partyCount;
    this.responseSchemaVersion = responseSchemaVersion;
    this.occurredAt = occurredAt;
  }
}
