package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

/**
 * Append-only security audit metadata for matter-party access and mutations.
 *
 * <p>No name, contact detail, identifier, address, free text, or encrypted payload is accepted by
 * this type. {@link Immutable} plus non-updatable columns prevents accidental ORM updates; the
 * repository intentionally exposes insert and read operations only.
 */
@Getter
@NoArgsConstructor
@Immutable
@Entity
@Table(
    name = "crm_matter_party_audit",
    indexes = {
      @Index(name = "idx_party_audit_case_time", columnList = "case_id, occurred_at"),
      @Index(name = "idx_party_audit_party_time", columnList = "party_id, occurred_at")
    })
public class MatterPartyAudit {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "case_id", length = 36, nullable = false, updatable = false)
  private String caseId;

  @Column(name = "party_id", length = 36, nullable = false, updatable = false)
  private String partyId;

  @Enumerated(EnumType.STRING)
  @Column(length = 16, nullable = false, updatable = false)
  private MatterPartyAuditAction action;

  @Column(name = "actor_user_id", length = 100, nullable = false, updatable = false)
  private String actorUserId;

  @Enumerated(EnumType.STRING)
  @Column(name = "party_role", length = 32, nullable = false, updatable = false)
  private MatterPartyRole partyRole;

  @Enumerated(EnumType.STRING)
  @Column(name = "party_type", length = 20, nullable = false, updatable = false)
  private MatterPartyType partyType;

  @Column(nullable = false, updatable = false)
  private long revision;

  @Column(name = "occurred_at", nullable = false, updatable = false)
  private Instant occurredAt;

  public MatterPartyAudit(
      String caseId,
      String partyId,
      MatterPartyAuditAction action,
      String actorUserId,
      MatterPartyRole partyRole,
      MatterPartyType partyType,
      long revision,
      Instant occurredAt) {
    this.id = UUID.randomUUID().toString();
    this.caseId = caseId;
    this.partyId = partyId;
    this.action = action;
    this.actorUserId = actorUserId;
    this.partyRole = partyRole;
    this.partyType = partyType;
    this.revision = revision;
    this.occurredAt = occurredAt;
  }
}
