package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CRM-side row for a case (monolith CustomerService). The "case" columns are a read-replica synced
 * from events; the "care" columns are owned by CRM (operators edit them). One table so the advanced
 * filter can query/sort/paginate everything in SQL with indexes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "crm_case",
    indexes = {
      @Index(name = "idx_crm_case_status", columnList = "status"),
      @Index(name = "idx_crm_case_assigned", columnList = "assigned_user_id"),
      @Index(name = "idx_crm_case_care_status", columnList = "care_status_id"),
      @Index(name = "idx_crm_case_next_follow_up", columnList = "next_follow_up_at"),
      @Index(name = "idx_crm_case_created", columnList = "case_created_at")
    })
public class CrmCase {

  /** Same id as the monolith CustomerService (UUID). */
  @Id
  @Column(length = 36)
  private String id;

  // ---- replicated from monolith (read-only here) ----
  private String customerId;
  private String customerEmail;
  private String customerPhone;
  private String serviceId;
  private String serviceName;
  private String name;

  @Column(length = 10000)
  private String description;

  private String status; // NEW/RECEIVED/PROCESSING/COMPLETED/CANCELED

  private Date caseCreatedAt;
  private Date caseUpdatedAt;

  // ---- owned by CRM ----
  private String assignedUserId; // staff User id, nullable

  @Column(name = "care_status_id")
  private Long careStatusId; // FK to CareStatus, nullable

  private Long lastCareResultId; // FK to CareResult, nullable
  private Instant lastCaredAt;
  private Date nextFollowUpAt;
  private String marketingSource;

  private Instant syncedAt; // last event applied
}
