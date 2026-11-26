package org.law_app.crm.web;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Canonical request & response DTOs for the 4 Enterprise CRM modules + Catalog + Activities. */
public final class EnterpriseCrmDtos {
  private EnterpriseCrmDtos() {}

  // ==================== 1. SERVICE CATALOG ====================

  public record ServiceCatalogItem(
      String code,
      String name,
      String serviceGroup,
      String unit,
      BigDecimal unitPrice,
      String vatRate) {}

  // ==================== SHARED LINE ITEM ====================

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record CrmLineItemDto(
      String id,
      int sortOrder,
      String itemCode,
      String description,
      String warehouse,
      String unit,
      BigDecimal quantity,
      BigDecimal deliveredQuantity,
      BigDecimal unitPrice,
      BigDecimal amount,
      BigDecimal tradeDiscount,
      BigDecimal discountRate,
      BigDecimal discountAmount,
      String vatRate,
      BigDecimal vatAmount,
      BigDecimal totalAmount,
      String parentContractNumber,
      String promotionCode,
      boolean freeItem) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record BulkImportRequest<T>(List<T> items) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record BulkActionRequest(
      List<String> ids,
      String action,
      String assignedUserId,
      String assignedUserName,
      Boolean shared,
      String tag) {}

  // ==================== 2. MODULE 1: LEADS (KH LIÊN HỆ) ====================

  public record CrmLeadDto(
      String id,
      String code,
      String sourceCaseId,
      List<String> tags,
      String customerName,
      String fullName,
      String phone,
      String taxCode,
      String personalEmail,
      String workEmail,
      List<String> serviceGroups,
      String jobTitle,
      String assignedUserId,
      String assignedUserName,
      String ownerUserId,
      String ownerUserName,
      String leadSource,
      String customerStatus,
      String demandDetail,
      String organizationName,
      String gender,
      String zalo,
      String website,
      LocalDate birthDate,
      String companySize,
      String country,
      String province,
      String district,
      String address,
      boolean shared,
      String department,
      String convertedAccountId,
      String convertedOpportunityId,
      Instant convertedAt,
      Instant lastInteractedAt,
      String createdBy,
      String updatedBy,
      Instant createdAt,
      Instant updatedAt,
      boolean deleted,
      Instant deletedAt,
      String deletedBy) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record LeadUpsertRequest(
      String code,
      String sourceCaseId,
      List<String> tags,
      String customerName,
      String fullName,
      String phone,
      String taxCode,
      String personalEmail,
      String workEmail,
      List<String> serviceGroups,
      String jobTitle,
      String assignedUserId,
      String assignedUserName,
      String ownerUserId,
      String ownerUserName,
      String leadSource,
      String customerStatus,
      String demandDetail,
      String organizationName,
      String gender,
      String zalo,
      String website,
      LocalDate birthDate,
      String companySize,
      String country,
      String province,
      String district,
      String address,
      Boolean shared,
      String department,
      Instant lastInteractedAt) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record LeadConvertRequest(
      Boolean createOpportunity,
      String opportunityName,
      BigDecimal expectedRevenue,
      String stage) {}

  public record LeadConvertResponse(String leadId, String accountId, String opportunityId) {}

  // ==================== 3. MODULE 2: ACCOUNTS (KHÁCH HÀNG) ====================

  public record CrmAccountDto(
      String id,
      String code,
      String sourceLeadId,
      List<String> tags,
      String customerName,
      String phone,
      List<String> careStatuses,
      String customerStatus,
      String lostReason,
      String leadSource,
      String assignedUserId,
      String assignedUserName,
      String ownerUserId,
      String ownerUserName,
      String relatedUsers,
      List<String> serviceGroups,
      String servicesSummary,
      String taxCode,
      List<String> industries,
      String email,
      String rankLabel,
      String contactName,
      String contactTitle,
      String contactPhone,
      String contactEmail,
      LocalDate contactBirthDate,
      String demandDetail,
      String billingProvince,
      String billingDistrict,
      String billingAddress,
      String companySize,
      LocalDate foundedDate,
      String paymentTermType,
      String website,
      BigDecimal annualRevenue,
      boolean shared,
      boolean individual,
      boolean partner,
      String referrer,
      String createdBy,
      String updatedBy,
      Instant createdAt,
      Instant updatedAt,
      boolean deleted,
      Instant deletedAt,
      String deletedBy) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record AccountUpsertRequest(
      String code,
      String sourceLeadId,
      List<String> tags,
      String customerName,
      String phone,
      List<String> careStatuses,
      String customerStatus,
      String lostReason,
      String leadSource,
      String assignedUserId,
      String assignedUserName,
      String ownerUserId,
      String ownerUserName,
      String relatedUsers,
      List<String> serviceGroups,
      String servicesSummary,
      String taxCode,
      List<String> industries,
      String email,
      String rankLabel,
      String contactName,
      String contactTitle,
      String contactPhone,
      String contactEmail,
      LocalDate contactBirthDate,
      String demandDetail,
      String billingProvince,
      String billingDistrict,
      String billingAddress,
      String companySize,
      LocalDate foundedDate,
      String paymentTermType,
      String website,
      BigDecimal annualRevenue,
      Boolean shared,
      Boolean individual,
      Boolean partner,
      String referrer) {}

  public record CrmAccountContactDto(
      String id,
      String accountId,
      String fullName,
      String jobTitle,
      String phone,
      String email,
      LocalDate birthDate,
      boolean primaryContact,
      Instant createdAt) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record AccountContactCreateRequest(
      String fullName,
      String jobTitle,
      String phone,
      String email,
      LocalDate birthDate,
      Boolean primaryContact) {}

  public record AccountKpisDto(
      long contractCount,
      BigDecimal totalOrderValue,
      BigDecimal totalCollected,
      BigDecimal totalReceivable,
      long opportunityCount,
      int purchaseCycleDays) {}

  public record CrmAccountOverviewDto(
      CrmAccountDto account,
      AccountKpisDto kpis,
      List<CrmAccountContactDto> contacts,
      List<CrmOpportunityDto> opportunities,
      List<CrmContractDto> contracts) {}

  // ==================== 4. MODULE 3: OPPORTUNITIES (CƠ HỘI HĐ) ====================

  public record CrmOpportunityDto(
      String id,
      String code,
      List<String> tags,
      String opportunityName,
      String accountId,
      String accountName,
      String contactName,
      String contactPhone,
      BigDecimal expectedRevenue,
      String stage,
      LocalDate expectedCloseDate,
      List<String> opportunityTypes,
      List<String> serviceGroups,
      String leadSource,
      String assignedUserId,
      String assignedUserName,
      boolean shared,
      String referrer,
      String notes,
      String convertedContractId,
      List<CrmLineItemDto> items,
      String createdBy,
      String updatedBy,
      Instant createdAt,
      Instant updatedAt,
      boolean deleted,
      Instant deletedAt,
      String deletedBy) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record OpportunityUpsertRequest(
      String code,
      List<String> tags,
      String opportunityName,
      String accountId,
      String accountName,
      String contactName,
      String contactPhone,
      BigDecimal expectedRevenue,
      String stage,
      LocalDate expectedCloseDate,
      List<String> opportunityTypes,
      List<String> serviceGroups,
      String leadSource,
      String assignedUserId,
      String assignedUserName,
      Boolean shared,
      String referrer,
      String notes,
      String convertedContractId,
      List<CrmLineItemDto> items) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record OpportunityStageRequest(String stage) {}

  public record CrmKanbanColumnDto(
      String stage, int count, BigDecimal totalExpectedRevenue, List<CrmOpportunityDto> items) {}

  // ==================== 5. MODULE 4: CONTRACTS & CASHFLOWS (HỢP ĐỒNG & THU CHI)
  // ====================

  public record CrmContractDto(
      String id,
      String contractNumber,
      String accountId,
      String accountCode,
      String accountName,
      String contactName,
      String opportunityId,
      String parentContractNumber,
      String goodsSummary,
      LocalDate bookingDate,
      LocalDate paymentDate,
      LocalDate submissionDate,
      LocalDate handoverDeadline,
      LocalDate orderDate,
      LocalDate productionDeadline,
      String revenueStatus,
      String executionStatus,
      String archivedStatus,
      String leadSource,
      String contractSource,
      String paymentTermType,
      String assignedUserId,
      String assignedUserName,
      String department,
      String unitName,
      BigDecimal liquidationValue,
      BigDecimal orderValue,
      BigDecimal collectedAmount,
      BigDecimal actualExpense,
      BigDecimal plannedExpense,
      BigDecimal receivableAmount,
      BigDecimal payableAmount,
      BigDecimal estimatedProfit,
      BigDecimal serviceExpense,
      BigDecimal stateFeeExpense,
      BigDecimal supportExpense,
      BigDecimal uninvoicedAmount,
      String invoiceLookupCode,
      String invoiceLookupUrl,
      String externalOrderNumber,
      String invoiceCustomerName,
      String buyerName,
      String invoiceCountry,
      String invoiceProvince,
      String invoiceDistrict,
      String invoiceAddress,
      String taxCode,
      boolean shared,
      String referrer,
      boolean syncPriceAfterDiscount,
      String notes,
      List<CrmLineItemDto> items,
      String createdBy,
      String updatedBy,
      Instant createdAt,
      Instant updatedAt,
      List<String> tags,
      boolean deleted,
      Instant deletedAt,
      String deletedBy) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record ContractUpsertRequest(
      String contractNumber,
      String accountId,
      String accountCode,
      String accountName,
      String contactName,
      String opportunityId,
      String parentContractNumber,
      String goodsSummary,
      LocalDate bookingDate,
      LocalDate paymentDate,
      LocalDate submissionDate,
      LocalDate handoverDeadline,
      LocalDate orderDate,
      LocalDate productionDeadline,
      String revenueStatus,
      String executionStatus,
      String archivedStatus,
      String leadSource,
      String contractSource,
      String paymentTermType,
      String assignedUserId,
      String assignedUserName,
      String department,
      String unitName,
      BigDecimal liquidationValue,
      BigDecimal orderValue,
      BigDecimal collectedAmount,
      BigDecimal actualExpense,
      BigDecimal plannedExpense,
      BigDecimal serviceExpense,
      BigDecimal stateFeeExpense,
      BigDecimal supportExpense,
      BigDecimal uninvoicedAmount,
      String invoiceLookupCode,
      String invoiceLookupUrl,
      String externalOrderNumber,
      String invoiceCustomerName,
      String buyerName,
      String invoiceCountry,
      String invoiceProvince,
      String invoiceDistrict,
      String invoiceAddress,
      String taxCode,
      Boolean shared,
      String referrer,
      Boolean syncPriceAfterDiscount,
      Boolean syncOrderValueFromItems,
      String notes,
      List<CrmLineItemDto> items,
      List<String> tags) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record ContractRevenueStatusRequest(String revenueStatus) {}

  public record CrmContractSummaryDto(
      long totalRecords,
      BigDecimal totalOrderValue,
      BigDecimal totalCollected,
      BigDecimal totalReceivable,
      BigDecimal totalEstimatedProfit,
      BigDecimal totalActualExpense,
      BigDecimal totalPlannedExpense,
      BigDecimal totalPayable,
      BigDecimal totalServiceExpense,
      BigDecimal totalStateFeeExpense,
      BigDecimal totalSupportExpense,
      BigDecimal totalLiquidationValue,
      BigDecimal totalUninvoicedAmount) {}

  public record CrmContractListPayload(List<CrmContractDto> rows, CrmContractSummaryDto summary) {}

  public record CrmContractCashflowDto(
      String id,
      String contractId,
      String type,
      String category,
      String description,
      BigDecimal amount,
      LocalDate transactionDate,
      String paymentMethod,
      String referenceCode,
      String status,
      String createdBy,
      String createdByName,
      Instant createdAt) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record CashflowCreateRequest(
      String type,
      String category,
      String description,
      String note,
      BigDecimal amount,
      LocalDate transactionDate,
      String paymentMethod,
      String referenceCode,
      String status) {}

  // ==================== 6. SHARED ACTIVITIES ====================

  public record CrmActivityDto(
      String id,
      String entityType,
      String entityId,
      String activityType,
      String title,
      String content,
      Instant dueAt,
      boolean completed,
      String createdBy,
      String createdByName,
      Instant createdAt) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record ActivityCreateRequest(
      String entityType,
      String entityId,
      String activityType,
      String title,
      String content,
      Instant dueAt,
      Boolean completed,
      String createdByName) {}
}
