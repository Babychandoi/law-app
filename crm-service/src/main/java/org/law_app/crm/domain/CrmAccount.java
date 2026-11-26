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
    name = "crm_account",
    indexes = {
      @Index(name = "idx_crm_account_code", columnList = "code"),
      @Index(name = "idx_crm_account_status", columnList = "customer_status"),
      @Index(name = "idx_crm_account_assigned", columnList = "assigned_user_id"),
      @Index(name = "idx_crm_account_tax_code", columnList = "tax_code"),
      @Index(name = "idx_crm_account_created", columnList = "created_at")
    })
public class CrmAccount {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "code", length = 32, unique = true)
  private String code;

  @Column(length = 36)
  private String sourceLeadId;

  @Column(name = "tags_json", length = 2000)
  private String tags;

  @Column(length = 255)
  private String customerName;

  @Column(length = 64)
  private String phone;

  @Column(name = "care_statuses", length = 2000)
  private String careStatuses;

  @Column(name = "customer_status", length = 120)
  private String customerStatus;

  @Column(length = 500)
  private String lostReason;

  @Column(length = 120)
  private String leadSource;

  @Column(name = "assigned_user_id", length = 64)
  private String assignedUserId;

  @Column(length = 255)
  private String assignedUserName;

  @Column(length = 64)
  private String ownerUserId;

  @Column(length = 255)
  private String ownerUserName;

  @Column(length = 500)
  private String relatedUsers;

  @Column(name = "service_groups", length = 2000)
  private String serviceGroups;

  @Column(length = 1000)
  private String servicesSummary;

  @Column(name = "tax_code", length = 64)
  private String taxCode;

  @Column(name = "industries_json", length = 2000)
  private String industries;

  @Column(length = 255)
  private String email;

  @Column(length = 120)
  private String rankLabel;

  @Column(length = 255)
  private String contactName;

  @Column(length = 255)
  private String contactTitle;

  @Column(length = 64)
  private String contactPhone;

  @Column(length = 255)
  private String contactEmail;

  private LocalDate contactBirthDate;

  @Column(length = 10000)
  private String demandDetail;

  @Column(length = 120)
  private String billingProvince;

  @Column(length = 120)
  private String billingDistrict;

  @Column(length = 2000)
  private String billingAddress;

  @Column(length = 120)
  private String companySize;

  private LocalDate foundedDate;

  @Column(length = 120)
  private String paymentTermType;

  @Column(length = 255)
  private String website;

  @Column(precision = 19, scale = 2)
  private BigDecimal annualRevenue;

  private boolean shared;

  private boolean individual;

  private boolean partner;

  @Column(length = 255)
  private String referrer;

  @Column(length = 100)
  private String createdBy;

  @Column(length = 100)
  private String updatedBy;

  @Column(name = "created_at")
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;

  @Column(nullable = false, columnDefinition = "boolean default false")
  private boolean deleted;

  private Instant deletedAt;

  @Column(length = 255)
  private String deletedBy;
}
