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
    name = "crm_contract",
    indexes = {
      @Index(name = "idx_crm_contract_number", columnList = "contract_number"),
      @Index(name = "idx_crm_contract_account", columnList = "account_id"),
      @Index(name = "idx_crm_contract_revenue_status", columnList = "revenue_status"),
      @Index(name = "idx_crm_contract_exec_status", columnList = "execution_status"),
      @Index(name = "idx_crm_contract_assigned", columnList = "assigned_user_id"),
      @Index(name = "idx_crm_contract_booking", columnList = "booking_date"),
      @Index(name = "idx_crm_contract_created", columnList = "created_at")
    })
public class CrmContract {

  @Id
  @Column(length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "contract_number", length = 64, unique = true)
  private String contractNumber;

  @Column(name = "account_id", length = 36)
  private String accountId;

  @Column(length = 32)
  private String accountCode;

  @Column(length = 255)
  private String accountName;

  @Column(length = 255)
  private String contactName;

  @Column(length = 36)
  private String opportunityId;

  @Column(length = 64)
  private String parentContractNumber;

  @Column(length = 2000)
  private String goodsSummary;

  @Column(name = "booking_date")
  private LocalDate bookingDate;

  @Column(name = "payment_date")
  private LocalDate paymentDate;

  private LocalDate submissionDate;

  private LocalDate handoverDeadline;

  @Column(name = "order_date")
  private LocalDate orderDate;

  private LocalDate productionDeadline;

  @Column(name = "revenue_status", length = 120)
  private String revenueStatus;

  @Column(name = "execution_status", length = 120)
  private String executionStatus;

  @Column(length = 120)
  private String archivedStatus;

  @Column(length = 120)
  private String leadSource;

  @Column(length = 120)
  private String contractSource;

  @Column(length = 120)
  private String paymentTermType;

  @Column(name = "assigned_user_id", length = 64)
  private String assignedUserId;

  @Column(length = 255)
  private String assignedUserName;

  @Column(length = 120)
  private String department;

  @Column(length = 255)
  private String unitName;

  @Column(precision = 19, scale = 2)
  private BigDecimal liquidationValue;

  @Column(precision = 19, scale = 2)
  private BigDecimal orderValue;

  @Column(precision = 19, scale = 2)
  private BigDecimal collectedAmount;

  @Column(precision = 19, scale = 2)
  private BigDecimal actualExpense;

  @Column(precision = 19, scale = 2)
  private BigDecimal plannedExpense;

  @Column(precision = 19, scale = 2)
  private BigDecimal receivableAmount;

  @Column(precision = 19, scale = 2)
  private BigDecimal payableAmount;

  @Column(precision = 19, scale = 2)
  private BigDecimal estimatedProfit;

  @Column(precision = 19, scale = 2)
  private BigDecimal serviceExpense;

  @Column(precision = 19, scale = 2)
  private BigDecimal stateFeeExpense;

  @Column(precision = 19, scale = 2)
  private BigDecimal supportExpense;

  @Column(precision = 19, scale = 2)
  private BigDecimal uninvoicedAmount;

  @Column(length = 120)
  private String invoiceLookupCode;

  @Column(length = 500)
  private String invoiceLookupUrl;

  @Column(length = 120)
  private String externalOrderNumber;

  @Column(length = 255)
  private String invoiceCustomerName;

  @Column(length = 255)
  private String buyerName;

  @Column(length = 120)
  private String invoiceCountry;

  @Column(length = 120)
  private String invoiceProvince;

  @Column(length = 120)
  private String invoiceDistrict;

  @Column(length = 2000)
  private String invoiceAddress;

  @Column(length = 64)
  private String taxCode;

  private boolean shared;

  @Column(length = 255)
  private String referrer;

  private boolean syncPriceAfterDiscount;

  @Column(length = 10000)
  private String notes;

  @Column(length = 100)
  private String createdBy;

  @Column(length = 100)
  private String updatedBy;

  @Column(name = "tags_json", length = 2000)
  private String tags;

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
