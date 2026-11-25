package org.law_app.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
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
    name = "crm_lead",
    indexes = {
      @Index(name = "idx_crm_lead_code", columnList = "code"),
      @Index(name = "idx_crm_lead_source_case", columnList = "source_case_id"),
      @Index(name = "idx_crm_lead_status", columnList = "customer_status"),
      @Index(name = "idx_crm_lead_assigned", columnList = "assigned_user_id"),
      @Index(name = "idx_crm_lead_created", columnList = "created_at")
    })
public class CrmLead {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "code", length = 32, unique = true)
  private String code;

  @Column(name = "source_case_id", length = 36)
  private String sourceCaseId;

  @Column(name = "tags_json", length = 2000)
  private String tags;

  @Column(length = 255)
  private String customerName;

  @Column(length = 255)
  private String fullName;

  @Column(length = 64)
  private String phone;

  @Column(length = 64)
  private String taxCode;

  @Column(length = 255)
  private String personalEmail;

  @Column(length = 255)
  private String workEmail;

  @Column(name = "service_groups", length = 2000)
  private String serviceGroups;

  @Column(length = 255)
  private String jobTitle;

  @Column(name = "assigned_user_id", length = 64)
  private String assignedUserId;

  @Column(length = 255)
  private String assignedUserName;

  @Column(length = 64)
  private String ownerUserId;

  @Column(length = 255)
  private String ownerUserName;

  @Column(length = 120)
  private String leadSource;

  @Column(name = "customer_status", length = 120)
  private String customerStatus;

  @Column(length = 10000)
  private String demandDetail;

  @Column(length = 255)
  private String organizationName;

  @Column(length = 32)
  private String gender;

  @Column(length = 100)
  private String zalo;

  @Column(length = 255)
  private String website;

  private LocalDate birthDate;

  @Column(length = 120)
  private String companySize;

  @Column(length = 120)
  private String country;

  @Column(length = 120)
  private String province;

  @Column(length = 120)
  private String district;

  @Column(length = 2000)
  private String address;

  private boolean shared;

  @Column(length = 120)
  private String department;

  @Column(length = 36)
  private String convertedAccountId;

  @Column(length = 36)
  private String convertedOpportunityId;

  private Instant convertedAt;

  private Instant lastInteractedAt;

  @Column(length = 100)
  private String createdBy;

  @Column(length = 100)
  private String updatedBy;

  @Column(name = "created_at")
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;
}
