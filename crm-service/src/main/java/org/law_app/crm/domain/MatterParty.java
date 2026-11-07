package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A person or organization participating in a legal matter.
 *
 * <p>The entity deliberately contains no plaintext PII. All identifying and contact data lives in
 * {@link #encryptedPii}, encrypted in the application layer before persistence.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "crm_matter_party",
    indexes = {
      @Index(name = "idx_matter_party_case_archived", columnList = "case_id, archived, created_at"),
      @Index(name = "idx_matter_party_case_role", columnList = "case_id, role")
    })
public class MatterParty {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "case_id", length = 36, nullable = false, updatable = false)
  private String caseId;

  @Enumerated(EnumType.STRING)
  @Column(length = 32, nullable = false)
  private MatterPartyRole role;

  @Enumerated(EnumType.STRING)
  @Column(name = "party_type", length = 20, nullable = false)
  private MatterPartyType type;

  @Lob
  @Column(name = "encrypted_pii", nullable = false, columnDefinition = "LONGTEXT")
  private String encryptedPii;

  /** JPA-managed compare-and-swap revision returned by the API. */
  @Version
  @Column(nullable = false)
  private long revision;

  @Column(nullable = false)
  private boolean archived;

  private Instant archivedAt;

  @Column(length = 100)
  private String archivedBy;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @Column(length = 100, nullable = false, updatable = false)
  private String createdBy;

  @Column(nullable = false)
  private Instant updatedAt;

  @Column(length = 100, nullable = false)
  private String updatedBy;
}
