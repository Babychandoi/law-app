import type { PageMeta, StaffUser } from '../../types/crm';

export type { PageMeta, StaffUser };

export type CrmViewMode = 'list' | 'kanban' | 'quickEdit';

export interface CrmFilterRule {
  field: string;
  op: string;
  value?: string;
  valueTo?: string;
}

export type CrmBulkActionType =
  | 'ASSIGN'
  | 'DELETE'
  | 'RESTORE'
  | 'SHARE'
  | 'UNSHARE'
  | 'ADD_TAG'
  | 'REMOVE_TAG';

export interface CrmBulkActionRequest {
  ids: string[];
  action: CrmBulkActionType;
  assignedUserId?: string;
  assignedUserName?: string;
  tag?: string;
}

export type CrmModuleEndpoint = 'leads' | 'accounts' | 'opportunities' | 'contracts';

export interface CrmApiResponse<T> {
  code: number;
  message?: string;
  data: T;
  meta?: PageMeta;
}

export interface CrmServiceCatalogItem {
  code: string;
  name: string;
  serviceGroup: string;
  unit: string;
  unitPrice: number;
  vatRate: string;
}

export interface CrmLineItemDto {
  id?: string | number;
  sortOrder?: number;
  itemCode?: string;
  serviceCode: string;
  code?: string;
  description: string;
  name?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  discountRate: number;
  discountAmount: number;
  vatRate: string;
  taxRate?: string;
  vatAmount: number;
  taxAmount?: number;
  totalAmount: number;
}

// ============================================================================
// 1. KH Liên hệ (/crm/leads)
// ============================================================================

export interface CrmLeadDto {
  id: string;
  code: string;
  sourceCaseId?: string | null;
  tags: string[];
  customerName: string;
  fullName: string;
  phone: string;
  taxCode?: string | null;
  personalEmail?: string | null;
  workEmail?: string | null;
  serviceGroups: string[];
  jobTitle?: string | null;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  ownerUserId?: string | null;
  ownerUserName?: string | null;
  leadSource?: string | null;
  customerStatus: string;
  demandDetail?: string | null;
  organizationName?: string | null;
  gender?: string | null;
  zalo?: string | null;
  website?: string | null;
  birthDate?: string | null;
  companySize?: string | null;
  country?: string | null;
  province?: string | null;
  district?: string | null;
  address?: string | null;
  shared?: boolean;
  deleted?: boolean;
  department?: string | null;
  convertedAccountId?: string | null;
  convertedOpportunityId?: string | null;
  convertedAt?: string | null;
  lastInteractedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type CrmLeadWritePayload = Partial<Omit<CrmLeadDto, 'id' | 'createdAt' | 'updatedAt'>>;

export interface CrmLeadFilter {
  keyword?: string;
  customerStatus?: string;
  leadSource?: string;
  assignedTo?: string;
  serviceGroup?: string;
  province?: string;
  from?: string;
  to?: string;
  filters?: CrmFilterRule[];
  deleted?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

export interface CrmLeadConvertRequest {
  createOpportunity: boolean;
  opportunityName?: string;
  expectedRevenue?: number;
  stage?: string;
}

export interface CrmLeadConvertResponse {
  leadId: string;
  accountId: string;
  opportunityId?: string | null;
}

// ============================================================================
// 2. Khách hàng (/crm/accounts)
// ============================================================================

export interface CrmAccountDto {
  id: string;
  code: string;
  sourceLeadId?: string | null;
  tags: string[];
  customerName: string;
  phone: string;
  careStatuses: string[];
  customerStatus: string;
  lostReason?: string | null;
  leadSource?: string | null;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  ownerUserId?: string | null;
  ownerUserName?: string | null;
  relatedUsers: string[];
  serviceGroups: string[];
  servicesSummary?: string | null;
  taxCode?: string | null;
  industries: string[];
  email?: string | null;
  rankLabel?: string | null;
  contactName?: string | null;
  contactTitle?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactBirthDate?: string | null;
  demandDetail?: string | null;
  billingProvince?: string | null;
  billingDistrict?: string | null;
  billingAddress?: string | null;
  companySize?: string | null;
  foundedDate?: string | null;
  paymentTermType?: string | null;
  website?: string | null;
  annualRevenue?: number | null;
  shared?: boolean;
  deleted?: boolean;
  individual?: boolean;
  partner?: boolean;
  referrer?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type CrmAccountWritePayload = Partial<Omit<CrmAccountDto, 'id' | 'createdAt' | 'updatedAt'>>;

export interface CrmAccountFilter {
  keyword?: string;
  customerStatus?: string;
  careStatus?: string;
  assignedTo?: string;
  serviceGroup?: string;
  billingProvince?: string;
  from?: string;
  to?: string;
  filters?: CrmFilterRule[];
  deleted?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

export interface CrmAccountContactDto {
  id: string;
  accountId?: string;
  fullName: string;
  jobTitle?: string | null;
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
  primary?: boolean;
  notes?: string | null;
}

export interface CrmAccountKpisDto {
  contractCount: number;
  totalOrderValue: number;
  totalCollected: number;
  totalReceivable: number;
  opportunityCount: number;
  purchaseCycleDays: number;
}

export interface CrmAccountOverviewDto {
  account: CrmAccountDto;
  kpis: CrmAccountKpisDto;
  contacts: CrmAccountContactDto[];
  opportunities: CrmOpportunityDto[];
  contracts: CrmContractDto[];
}

// ============================================================================
// 3. Cơ hội HĐ (/crm/opportunities)
// ============================================================================

export interface CrmOpportunityDto {
  id: string;
  code: string;
  tags: string[];
  opportunityName: string;
  accountId?: string | null;
  accountName?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  expectedRevenue: number;
  stage: string;
  expectedCloseDate?: string | null;
  opportunityTypes: string[];
  serviceGroups: string[];
  leadSource?: string | null;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  shared?: boolean;
  deleted?: boolean;
  referrer?: string | null;
  notes?: string | null;
  convertedContractId?: string | null;
  items: CrmLineItemDto[];
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type CrmOpportunityWritePayload = Partial<
  Omit<CrmOpportunityDto, 'id' | 'createdAt' | 'updatedAt'>
>;

export interface CrmOpportunityFilter {
  keyword?: string;
  stage?: string;
  assignedTo?: string;
  serviceGroup?: string;
  accountId?: string;
  from?: string;
  to?: string;
  filters?: CrmFilterRule[];
  deleted?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

export interface CrmKanbanColumnDto {
  stage: string;
  count: number;
  totalExpectedRevenue: number;
  items: CrmOpportunityDto[];
}

// ============================================================================
// 4. Hợp đồng (/crm/contracts)
// ============================================================================

export interface CrmContractDto {
  id: string;
  contractNumber: string;
  tags?: string[];
  accountId?: string | null;
  accountCode?: string | null;
  accountName?: string | null;
  contactName?: string | null;
  opportunityId?: string | null;
  parentContractNumber?: string | null;
  goodsSummary?: string | null;
  bookingDate?: string | null;
  paymentDate?: string | null;
  submissionDate?: string | null;
  handoverDeadline?: string | null;
  orderDate?: string | null;
  productionDeadline?: string | null;
  revenueStatus: string;
  executionStatus: string;
  archivedStatus?: string | null;
  leadSource?: string | null;
  contractSource?: string | null;
  paymentTermType?: string | null;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  department?: string | null;
  unitName?: string | null;
  liquidationValue: number;
  orderValue: number;
  collectedAmount: number;
  actualExpense: number;
  plannedExpense: number;
  receivableAmount: number;
  payableAmount: number;
  estimatedProfit: number;
  serviceExpense: number;
  stateFeeExpense: number;
  supportExpense: number;
  uninvoicedAmount: number;
  invoiceLookupCode?: string | null;
  invoiceLookupUrl?: string | null;
  externalOrderNumber?: string | null;
  invoiceCustomerName?: string | null;
  buyerName?: string | null;
  invoiceCountry?: string | null;
  invoiceProvince?: string | null;
  invoiceDistrict?: string | null;
  invoiceAddress?: string | null;
  taxCode?: string | null;
  shared?: boolean;
  deleted?: boolean;
  referrer?: string | null;
  syncPriceAfterDiscount?: boolean;
  notes?: string | null;
  items: CrmLineItemDto[];
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type CrmContractWritePayload = Partial<
  Omit<CrmContractDto, 'id' | 'createdAt' | 'updatedAt'>
>;

export interface CrmContractFilter {
  keyword?: string;
  revenueStatus?: string;
  executionStatus?: string;
  assignedTo?: string;
  department?: string;
  accountId?: string;
  bookingFrom?: string;
  bookingTo?: string;
  paymentFrom?: string;
  paymentTo?: string;
  preset?: string;
  filters?: CrmFilterRule[];
  deleted?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

export interface CrmContractSummaryDto {
  totalRecords: number;
  totalOrderValue: number;
  totalCollected: number;
  totalReceivable: number;
  totalEstimatedProfit: number;
  totalActualExpense?: number;
  totalPlannedExpense?: number;
  totalPayable?: number;
  totalServiceExpense?: number;
  totalStateFeeExpense?: number;
  totalSupportExpense?: number;
  totalLiquidationValue?: number;
  totalUninvoicedAmount?: number;
}

export interface CrmContractListPayload {
  rows: CrmContractDto[];
  summary: CrmContractSummaryDto;
}

export type CrmCashflowLedgerType = 'THUC_THU' | 'DU_KIEN_CHI' | 'THUC_CHI';

export interface CrmContractCashflowDto {
  id: string;
  contractId: string;
  flowType: CrmCashflowLedgerType;
  title: string;
  amount: number;
  transactionDate: string;
  paymentMethod?: string | null;
  expenseCategory?: string | null;
  referenceCode?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  createdByName?: string | null;
  createdAt?: string | null;
}

export interface CrmContractCashflowWritePayload {
  flowType: CrmCashflowLedgerType;
  type?: CrmCashflowLedgerType;
  title: string;
  description?: string;
  amount: number;
  transactionDate: string;
  flowDate?: string;
  paymentMethod?: string;
  expenseCategory?: string;
  referenceCode?: string;
  notes?: string;
}

// ============================================================================
// 5. Hoạt động dùng chung (/crm/activities)
// ============================================================================

export type CrmEntityType = 'LEAD' | 'ACCOUNT' | 'OPPORTUNITY' | 'CONTRACT';
export type CrmActivityType = 'CALL' | 'TASK' | 'MEETING' | 'EMAIL' | 'NOTE';

export interface CrmActivityDto {
  id: string;
  entityType: CrmEntityType;
  entityId: string;
  activityType: CrmActivityType | string;
  title: string;
  content?: string | null;
  dueAt?: string | null;
  completed: boolean;
  createdBy?: string | null;
  createdByName?: string | null;
  createdAt?: string | null;
}

export interface CrmActivityWritePayload {
  entityType: CrmEntityType;
  entityId: string;
  activityType: CrmActivityType | string;
  title: string;
  content?: string;
  dueAt?: string;
  completed?: boolean;
  createdByName?: string;
}
