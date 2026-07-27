package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One recorded care interaction on a case (immutable history). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "crm_care_log",
    indexes = @Index(name = "idx_care_log_case", columnList = "case_id, created_at"))
public class CareLog {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String caseId;
  private String staffId; // who performed the care
  private Long actionId;
  private Long resultId;
  private Long newStatusId; // care status set by this interaction

  @Column(length = 5000)
  private String note;

  private Date followUpAt;

  @Column(updatable = false)
  private Instant createdAt;
}
