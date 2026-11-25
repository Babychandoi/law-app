package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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
    name = "crm_opportunity",
    indexes = {
      @Index(name = "idx_crm_opportunity_code", columnList = "code"),
      @Index(name = "idx_crm_opportunity_stage", columnList = "stage"),
      @Index(name = "idx_crm_opportunity_account", columnList = "account_id"),
      @Index(name = "idx_crm_opportunity_assigned", columnList = "assigned_user_id"),
      @Index(name = "idx_crm_opportunity_created", columnList = "created_at")
    })
public class CrmOpportunity {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "code", length = 32, unique = true)
  private String code;

  @Column(name = "tags_json", length = 2000)
  private String tags;

  @Column(length = 500)
  private String opportunityName;

  @Column(name = "account_id", length = 36)
  private String accountId;

  @Column(length = 255)
  private String accountName;

  @Column(length = 255)
  private String contactName;

  @Column(length = 64)
  private String contactPhone;

  @Column(precision = 19, scale = 2)
  private BigDecimal expectedRevenue;

  @Column(name = "stage", length = 150)
  private String stage;

  private LocalDate expectedCloseDate;

  @Column(name = "opportunity_types", length = 2000)
  private String opportunityTypes;

  @Column(name = "service_groups", length = 2000)
  private String serviceGroups;

  @Column(length = 120)
  private String leadSource;

  @Column(name = "assigned_user_id", length = 64)
  private String assignedUserId;

  @Column(length = 255)
  private String assignedUserName;

  private boolean shared;

  @Column(length = 255)
  private String referrer;

  @Column(length = 10000)
  private String notes;

  @Column(length = 36)
  private String convertedContractId;

  @Column(length = 100)
  private String createdBy;

  @Column(length = 100)
  private String updatedBy;

  @Column(name = "created_at")
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;
}
