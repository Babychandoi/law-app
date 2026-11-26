import { useCallback, useState } from 'react';
import type { CrmColumnOption } from './CrmColumnPicker';
import type { CrmFilterRule } from './types';

export interface CrmSummaryFieldOption {
  key: string;
  label: string;
}

export interface CrmSortFieldOption {
  field: string;
  label: string;
}

export type CrmViewSection = 'FAVORITE' | 'SHARED' | 'MINE';

export interface CrmSavedView {
  id: string;
  name: string;
  section: CrmViewSection;
  favorite: boolean;
  shared: boolean;
  isSystem?: boolean;
  preset?: string;
  rules?: CrmFilterRule[];
  onlyMine?: boolean;
  columns: string[];
  summaryKeys: string[];
  sortField: string;
  sortDir: 'asc' | 'desc';
}

// ============================================================================
// 1. Hợp đồng (`ContractListPage`)
// ============================================================================

export const CONTRACT_DEFAULT_COLUMN_KEYS: string[] = [
  'bookingDate',
  'paymentDate',
  'goodsSummary',
  'revenueStatus',
  'executionStatus',
  'assignedUserName',
  'contractNumber',
  'accountName',
  'orderValue',
  'collectedAmount',
  'actualExpense',
  'plannedExpense',
  'receivableAmount',
  'payableAmount',
  'estimatedProfit',
  'department',
];

export const CONTRACT_ALL_COLUMNS: CrmColumnOption[] = [
  { key: 'bookingDate', label: 'Ngày ghi sổ' },
  { key: 'paymentDate', label: 'Ngày thanh toán' },
  { key: 'goodsSummary', label: 'Hàng hóa' },
  { key: 'revenueStatus', label: 'Tình trạng ghi doanh số' },
  { key: 'executionStatus', label: 'Tình trạng thực hiện HĐ' },
  { key: 'assignedUserName', label: 'Người phụ trách' },
  { key: 'contractNumber', label: 'Số Hợp đồng', locked: true },
  { key: 'accountName', label: 'Khách hàng', locked: true },
  { key: 'orderValue', label: 'Giá trị đơn hàng' },
  { key: 'collectedAmount', label: 'Thực thu' },
  { key: 'actualExpense', label: 'Thực chi' },
  { key: 'plannedExpense', label: 'Dự kiến chi' },
  { key: 'receivableAmount', label: 'Còn phải thu' },
  { key: 'payableAmount', label: 'Còn phải chi' },
  { key: 'estimatedProfit', label: 'Dự kiến lãi lỗ' },
  { key: 'department', label: 'Bộ phận phụ trách' },
  // Extended columns available in "Sửa giao diện"
  { key: 'serviceExpense', label: 'Chi dịch vụ' },
  { key: 'stateFeeExpense', label: 'Chi nhà nước' },
  { key: 'supportExpense', label: 'Chi hỗ trợ' },
  { key: 'handoverDeadline', label: 'Hạn bàn giao KQ' },
  { key: 'submissionDate', label: 'Ngày nộp hồ sơ' },
  { key: 'contractSource', label: 'Nguồn gốc Hợp đồng' },
  { key: 'leadSource', label: 'Nguồn gốc KH' },
  { key: 'archivedStatus', label: 'HĐ Lưu' },
  { key: 'paymentTermType', label: 'Loại điều khoản TT' },
  { key: 'parentContractNumber', label: 'Hợp đồng cha / liên quan' },
  { key: 'liquidationValue', label: 'Giá trị thanh lý' },
  { key: 'uninvoicedAmount', label: 'Giá trị chưa xuất hóa đơn' },
  { key: 'productionDeadline', label: 'Hạn sản xuất' },
  { key: 'contactName', label: 'Liên hệ' },
  { key: 'accountCode', label: 'Mã khách hàng' },
  { key: 'taxCode', label: 'Mã số thuế' },
  { key: 'invoiceCustomerName', label: 'Khách hàng (Hóa đơn)' },
  { key: 'buyerName', label: 'Người mua hàng' },
  { key: 'invoiceProvince', label: 'Tỉnh/Thành phố (Hóa đơn)' },
  { key: 'invoiceLookupCode', label: 'Mã tra cứu hóa đơn' },
  { key: 'unitName', label: 'Đơn vị' },
  { key: 'orderDate', label: 'Ngày đặt hàng' },
  { key: 'referrer', label: 'Đối tác/CTV giới thiệu' },
  { key: 'tags', label: 'Thẻ' },
  { key: 'shared', label: 'Dùng chung' },
  { key: 'createdAt', label: 'Ngày tạo' },
];

export const CONTRACT_DEFAULT_SUMMARY_KEYS: string[] = [
  'orderValue',
  'collectedAmount',
  'receivableAmount',
  'estimatedProfit',
];

export const CONTRACT_ALL_SUMMARY_FIELDS: CrmSummaryFieldOption[] = [
  { key: 'orderValue', label: 'Giá trị đơn hàng' },
  { key: 'collectedAmount', label: 'Thực thu' },
  { key: 'receivableAmount', label: 'Còn phải thu' },
  { key: 'estimatedProfit', label: 'Dự kiến lãi lỗ' },
  { key: 'actualExpense', label: 'Thực chi' },
  { key: 'plannedExpense', label: 'Dự kiến chi' },
  { key: 'payableAmount', label: 'Còn phải chi' },
  { key: 'serviceExpense', label: 'Chi dịch vụ' },
  { key: 'stateFeeExpense', label: 'Chi nhà nước' },
  { key: 'supportExpense', label: 'Chi hỗ trợ' },
  { key: 'liquidationValue', label: 'Giá trị thanh lý' },
  { key: 'uninvoicedAmount', label: 'Giá trị chưa xuất hóa đơn' },
];

export const CONTRACT_SORT_FIELDS: CrmSortFieldOption[] = [
  { field: 'createdAt', label: 'Ngày tạo' },
  { field: 'bookingDate', label: 'Ngày ghi sổ' },
  { field: 'paymentDate', label: 'Ngày thanh toán' },
  { field: 'contractNumber', label: 'Số Hợp đồng' },
  { field: 'orderValue', label: 'Giá trị đơn hàng' },
  { field: 'collectedAmount', label: 'Thực thu' },
  { field: 'receivableAmount', label: 'Còn phải thu' },
  { field: 'estimatedProfit', label: 'Dự kiến lãi lỗ' },
];

export const CONTRACT_SYSTEM_VIEWS: CrmSavedView[] = [
  {
    id: 'ALL',
    name: 'Tất cả Hợp đồng',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    columns: CONTRACT_DEFAULT_COLUMN_KEYS,
    summaryKeys: CONTRACT_DEFAULT_SUMMARY_KEYS,
    sortField: 'bookingDate',
    sortDir: 'desc',
  },
  {
    id: 'KPI',
    name: 'KPI',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'revenueStatus', op: 'EQ', value: 'Đã ghi' }],
    columns: CONTRACT_DEFAULT_COLUMN_KEYS,
    summaryKeys: CONTRACT_DEFAULT_SUMMARY_KEYS,
    sortField: 'bookingDate',
    sortDir: 'desc',
  },
  {
    id: 'KPI_GROUP',
    name: 'KPI NHÓM',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'revenueStatus', op: 'EQ', value: 'Đề nghị ghi' }],
    columns: CONTRACT_DEFAULT_COLUMN_KEYS,
    summaryKeys: CONTRACT_DEFAULT_SUMMARY_KEYS,
    sortField: 'bookingDate',
    sortDir: 'desc',
  },
  {
    id: 'LAST_MONTH',
    name: 'HĐ - THÁNG TRƯỚC',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'bookingDate', op: 'LAST_MONTH' }],
    columns: CONTRACT_DEFAULT_COLUMN_KEYS,
    summaryKeys: CONTRACT_DEFAULT_SUMMARY_KEYS,
    sortField: 'bookingDate',
    sortDir: 'desc',
  },
  {
    id: 'IN_PROGRESS',
    name: 'HĐ - ĐANG THỰC HIỆN',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'executionStatus', op: 'NEQ', value: 'Đã hoàn thành' }],
    columns: CONTRACT_DEFAULT_COLUMN_KEYS,
    summaryKeys: CONTRACT_DEFAULT_SUMMARY_KEYS,
    sortField: 'bookingDate',
    sortDir: 'desc',
  },
  {
    id: 'DRAFT',
    name: 'HĐ - BẢN NHÁP',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'revenueStatus', op: 'EQ', value: 'Bản nháp' }],
    columns: CONTRACT_DEFAULT_COLUMN_KEYS,
    summaryKeys: CONTRACT_DEFAULT_SUMMARY_KEYS,
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'SHARED_TEAM',
    name: 'Hợp đồng của nhóm tôi',
    section: 'SHARED',
    favorite: false,
    shared: true,
    isSystem: true,
    rules: [{ field: 'shared', op: 'TRUE', value: 'true' }],
    columns: CONTRACT_DEFAULT_COLUMN_KEYS,
    summaryKeys: CONTRACT_DEFAULT_SUMMARY_KEYS,
    sortField: 'bookingDate',
    sortDir: 'desc',
  },
  {
    id: 'DEBT_COLLECTION',
    name: 'Cần thu hồi công nợ',
    section: 'SHARED',
    favorite: false,
    shared: true,
    isSystem: true,
    preset: 'UNPAID',
    rules: [{ field: 'receivableAmount', op: 'GT_ZERO' }],
    columns: CONTRACT_DEFAULT_COLUMN_KEYS,
    summaryKeys: CONTRACT_DEFAULT_SUMMARY_KEYS,
    sortField: 'receivableAmount',
    sortDir: 'desc',
  },
  {
    id: 'MINE',
    name: 'Hợp đồng của tôi',
    section: 'MINE',
    favorite: false,
    shared: false,
    isSystem: true,
    onlyMine: true,
    columns: CONTRACT_DEFAULT_COLUMN_KEYS,
    summaryKeys: CONTRACT_DEFAULT_SUMMARY_KEYS,
    sortField: 'bookingDate',
    sortDir: 'desc',
  },
];

// ============================================================================
// 2. KH Liên hệ (`LeadListPage`)
// ============================================================================

export const LEAD_DEFAULT_COLUMN_KEYS: string[] = [
  'tags',
  'createdAt',
  'customerStatus',
  'assignedUserName',
  'fullName',
  'phone',
  'serviceGroups',
  'demandDetail',
  'organizationName',
  'province',
  'leadSource',
  'ownerUserName',
];

export const LEAD_ALL_COLUMNS: CrmColumnOption[] = [
  { key: 'tags', label: 'Thẻ' },
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'customerStatus', label: 'Trạng thái khách hàng' },
  { key: 'assignedUserName', label: 'Người phụ trách' },
  { key: 'fullName', label: 'Họ và tên', locked: true },
  { key: 'phone', label: 'Điện thoại', locked: true },
  { key: 'serviceGroups', label: 'Nhóm dịch vụ' },
  { key: 'demandDetail', label: 'Chi tiết nhu cầu KH' },
  { key: 'organizationName', label: 'Tổ chức' },
  { key: 'province', label: 'Tỉnh/Thành phố' },
  { key: 'leadSource', label: 'Nguồn gốc KH' },
  { key: 'ownerUserName', label: 'Chủ sở hữu' },
  // Extended columns
  { key: 'code', label: 'Mã tiềm năng' },
  { key: 'taxCode', label: 'Mã số thuế' },
  { key: 'personalEmail', label: 'Email cá nhân' },
  { key: 'workEmail', label: 'Email cơ quan' },
  { key: 'jobTitle', label: 'Chức danh' },
  { key: 'gender', label: 'Giới tính' },
  { key: 'zalo', label: 'Zalo' },
  { key: 'website', label: 'Website' },
  { key: 'birthDate', label: 'Ngày sinh' },
  { key: 'companySize', label: 'Quy mô nhân sự' },
  { key: 'district', label: 'Quận/Huyện' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'department', label: 'Đơn vị' },
  { key: 'shared', label: 'Dùng chung' },
  { key: 'lastInteractedAt', label: 'Ngày tương tác gần nhất' },
];

export const LEAD_SORT_FIELDS: CrmSortFieldOption[] = [
  { field: 'createdAt', label: 'Ngày tạo' },
  { field: 'fullName', label: 'Họ và tên' },
  { field: 'code', label: 'Mã tiềm năng' },
  { field: 'customerStatus', label: 'Trạng thái khách hàng' },
  { field: 'lastInteractedAt', label: 'Ngày tương tác gần nhất' },
];

export const LEAD_SYSTEM_VIEWS: CrmSavedView[] = [
  {
    id: 'ALL',
    name: 'Tất cả KH Liên hệ',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    columns: LEAD_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'HIGH_DEMAND',
    name: 'Nhu cầu cao cần gọi ngay',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'customerStatus', op: 'EQ', value: '2/ Nhu cầu cao' }],
    columns: LEAD_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'POTENTIAL',
    name: 'Khách tiềm năng',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'customerStatus', op: 'EQ', value: '3/ Tiềm năng' }],
    columns: LEAD_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'CONVERTED',
    name: 'Đã chốt hợp đồng',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'customerStatus', op: 'EQ', value: '1/ Chốt hợp đồng' }],
    columns: LEAD_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'FOLLOW_UP',
    name: 'Tiếp tục chăm sóc',
    section: 'SHARED',
    favorite: false,
    shared: true,
    isSystem: true,
    rules: [{ field: 'customerStatus', op: 'EQ', value: '4/ Tiếp tục chăm sóc' }],
    columns: LEAD_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'MINE',
    name: 'KH Liên hệ của tôi',
    section: 'MINE',
    favorite: false,
    shared: false,
    isSystem: true,
    onlyMine: true,
    columns: LEAD_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
];

// ============================================================================
// 3. Khách hàng (`AccountListPage`)
// ============================================================================

export const ACCOUNT_DEFAULT_COLUMN_KEYS: string[] = [
  'createdAt',
  'customerStatus',
  'serviceGroups',
  'demandDetail',
  'assignedUserName',
  'customerName',
  'relatedUsers',
  'phone',
  'servicesSummary',
  'careStatuses',
  'ownerUserName',
  'billingProvince',
];

export const ACCOUNT_ALL_COLUMNS: CrmColumnOption[] = [
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'customerStatus', label: 'Trạng thái khách hàng' },
  { key: 'serviceGroups', label: 'Nhóm dịch vụ' },
  { key: 'demandDetail', label: 'Chi tiết nhu cầu KH' },
  { key: 'assignedUserName', label: 'Người phụ trách' },
  { key: 'customerName', label: 'Tên khách hàng', locked: true },
  { key: 'relatedUsers', label: 'Người liên quan' },
  { key: 'phone', label: 'Điện thoại', locked: true },
  { key: 'servicesSummary', label: 'Dịch vụ' },
  { key: 'careStatuses', label: 'Tình trạng chăm sóc KH' },
  { key: 'ownerUserName', label: 'Chủ sở hữu' },
  { key: 'billingProvince', label: 'Tỉnh/Thành phố (Hóa đơn)' },
  // Extended columns
  { key: 'code', label: 'Mã khách hàng' },
  { key: 'tags', label: 'Thẻ' },
  { key: 'taxCode', label: 'Mã số thuế' },
  { key: 'email', label: 'Email' },
  { key: 'industries', label: 'Lĩnh vực/ngành nghề' },
  { key: 'leadSource', label: 'Nguồn gốc KH' },
  { key: 'rankLabel', label: 'Hạng khách hàng' },
  { key: 'contactName', label: 'Tên liên hệ' },
  { key: 'contactPhone', label: 'Điện thoại liên hệ' },
  { key: 'contactEmail', label: 'Email liên hệ' },
  { key: 'billingDistrict', label: 'Quận/Huyện (Hóa đơn)' },
  { key: 'billingAddress', label: 'Địa chỉ (Hóa đơn)' },
  { key: 'companySize', label: 'Quy mô nhân sự' },
  { key: 'foundedDate', label: 'Ngày thành lập' },
  { key: 'paymentTermType', label: 'Loại điều khoản TT' },
  { key: 'annualRevenue', label: 'Doanh thu' },
  { key: 'shared', label: 'Dùng chung' },
  { key: 'individual', label: 'Là KH cá nhân' },
  { key: 'partner', label: 'Là đối tác/CTV' },
];

export const ACCOUNT_SORT_FIELDS: CrmSortFieldOption[] = [
  { field: 'createdAt', label: 'Ngày tạo' },
  { field: 'customerName', label: 'Tên khách hàng' },
  { field: 'code', label: 'Mã khách hàng' },
  { field: 'customerStatus', label: 'Trạng thái khách hàng' },
  { field: 'annualRevenue', label: 'Doanh thu' },
];

export const ACCOUNT_SYSTEM_VIEWS: CrmSavedView[] = [
  {
    id: 'ALL',
    name: 'Tất cả Khách hàng',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    columns: ACCOUNT_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'WON_CONTRACT',
    name: 'Đã chốt hợp đồng',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'customerStatus', op: 'EQ', value: 'Đã chốt hợp đồng' }],
    columns: ACCOUNT_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'URGENT_NEED',
    name: 'Nhu cầu cao/Gấp',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'customerStatus', op: 'EQ', value: 'Nhu cầu cao/Gấp' }],
    columns: ACCOUNT_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'POTENTIAL',
    name: 'Khách hàng tiềm năng',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'customerStatus', op: 'EQ', value: 'Tiềm năng' }],
    columns: ACCOUNT_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'SHARED_CARE',
    name: 'Khách hàng nhóm phụ trách',
    section: 'SHARED',
    favorite: false,
    shared: true,
    isSystem: true,
    rules: [{ field: 'shared', op: 'TRUE', value: 'true' }],
    columns: ACCOUNT_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'MINE',
    name: 'Khách hàng của tôi',
    section: 'MINE',
    favorite: false,
    shared: false,
    isSystem: true,
    onlyMine: true,
    columns: ACCOUNT_DEFAULT_COLUMN_KEYS,
    summaryKeys: [],
    sortField: 'createdAt',
    sortDir: 'desc',
  },
];

// ============================================================================
// 4. Cơ hội HĐ (`OpportunityListPage`)
// ============================================================================

export const OPPORTUNITY_DEFAULT_COLUMN_KEYS: string[] = [
  'tags',
  'opportunityName',
  'contactName',
  'expectedRevenue',
  'stage',
  'expectedCloseDate',
  'serviceGroups',
  'assignedUserName',
  'createdAt',
];

export const OPPORTUNITY_ALL_COLUMNS: CrmColumnOption[] = [
  { key: 'tags', label: 'Thẻ' },
  { key: 'opportunityName', label: 'Tên cơ hội', locked: true },
  { key: 'contactName', label: 'Liên hệ' },
  { key: 'expectedRevenue', label: 'Số tiền', locked: true },
  { key: 'stage', label: 'Giai đoạn' },
  { key: 'expectedCloseDate', label: 'Ngày kỳ vọng/kết thúc' },
  { key: 'serviceGroups', label: 'Loại hàng hóa' },
  { key: 'assignedUserName', label: 'Người thực hiện' },
  { key: 'createdAt', label: 'Ngày tạo' },
  // Extended columns
  { key: 'code', label: 'Mã cơ hội' },
  { key: 'accountName', label: 'Khách hàng' },
  { key: 'contactPhone', label: 'SĐT liên hệ' },
  { key: 'opportunityTypes', label: 'Loại cơ hội' },
  { key: 'leadSource', label: 'Nguồn gốc KH' },
  { key: 'referrer', label: 'Đối tác/CTV giới thiệu' },
  { key: 'notes', label: 'Ghi chú' },
  { key: 'shared', label: 'Dùng chung' },
  { key: 'updatedAt', label: 'Ngày sửa' },
];

export const OPPORTUNITY_DEFAULT_SUMMARY_KEYS: string[] = ['expectedRevenue'];

export const OPPORTUNITY_ALL_SUMMARY_FIELDS: CrmSummaryFieldOption[] = [
  { key: 'expectedRevenue', label: 'Số tiền kỳ vọng' },
];

export const OPPORTUNITY_SORT_FIELDS: CrmSortFieldOption[] = [
  { field: 'createdAt', label: 'Ngày tạo' },
  { field: 'expectedCloseDate', label: 'Ngày kỳ vọng/kết thúc' },
  { field: 'expectedRevenue', label: 'Số tiền' },
  { field: 'opportunityName', label: 'Tên cơ hội' },
  { field: 'stage', label: 'Giai đoạn' },
];

export const OPPORTUNITY_SYSTEM_VIEWS: CrmSavedView[] = [
  {
    id: 'ALL',
    name: 'Cơ hội Hợp đồng',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    columns: OPPORTUNITY_DEFAULT_COLUMN_KEYS,
    summaryKeys: OPPORTUNITY_DEFAULT_SUMMARY_KEYS,
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'DRAFT_CONTRACT',
    name: 'Đang gửi HĐ dự thảo',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'stage', op: 'EQ', value: '6/ Gửi HĐ dự thảo cho KH' }],
    columns: OPPORTUNITY_DEFAULT_COLUMN_KEYS,
    summaryKeys: OPPORTUNITY_DEFAULT_SUMMARY_KEYS,
    sortField: 'expectedCloseDate',
    sortDir: 'asc',
  },
  {
    id: 'FIRST_PAYMENT',
    name: 'KH thanh toán lần 1',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'stage', op: 'EQ', value: '7/ KH thanh toán lần 1' }],
    columns: OPPORTUNITY_DEFAULT_COLUMN_KEYS,
    summaryKeys: OPPORTUNITY_DEFAULT_SUMMARY_KEYS,
    sortField: 'expectedCloseDate',
    sortDir: 'desc',
  },
  {
    id: 'QUALIFIED',
    name: 'Đủ điều kiện hồ sơ',
    section: 'FAVORITE',
    favorite: true,
    shared: true,
    isSystem: true,
    rules: [{ field: 'stage', op: 'EQ', value: '5/ KH đủ điều kiện hồ sơ' }],
    columns: OPPORTUNITY_DEFAULT_COLUMN_KEYS,
    summaryKeys: OPPORTUNITY_DEFAULT_SUMMARY_KEYS,
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'SHARED_TEAM',
    name: 'Cơ hội nhóm tôi',
    section: 'SHARED',
    favorite: false,
    shared: true,
    isSystem: true,
    rules: [{ field: 'shared', op: 'TRUE', value: 'true' }],
    columns: OPPORTUNITY_DEFAULT_COLUMN_KEYS,
    summaryKeys: OPPORTUNITY_DEFAULT_SUMMARY_KEYS,
    sortField: 'createdAt',
    sortDir: 'desc',
  },
  {
    id: 'MINE',
    name: 'Cơ hội của tôi',
    section: 'MINE',
    favorite: false,
    shared: false,
    isSystem: true,
    onlyMine: true,
    columns: OPPORTUNITY_DEFAULT_COLUMN_KEYS,
    summaryKeys: OPPORTUNITY_DEFAULT_SUMMARY_KEYS,
    sortField: 'createdAt',
    sortDir: 'desc',
  },
];

// ============================================================================
// Hook quản lý Giao diện (Views) lưu trong localStorage
// ============================================================================

export function useCrmSavedViews(
  storagePrefix: string,
  systemViews: CrmSavedView[],
  allColumns: CrmColumnOption[],
  defaultColumnKeys: string[],
  defaultSummaryKeys: string[],
  defaultSortField: string
) {
  const viewsKey = `${storagePrefix}.views.v1`;
  const pinnedKey = `${storagePrefix}.pinnedViewId`;

  const [views, setViews] = useState<CrmSavedView[]>(() => {
    try {
      const raw = window.localStorage.getItem(viewsKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CrmSavedView[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage error
    }
    return systemViews;
  });

  const [pinnedViewId, setPinnedViewIdState] = useState<string>(() => {
    try {
      return window.localStorage.getItem(pinnedKey) || systemViews[0]?.id || 'ALL';
    } catch {
      return systemViews[0]?.id || 'ALL';
    }
  });

  const [activeViewId, setActiveViewId] = useState<string>(() => {
    try {
      const pinned = window.localStorage.getItem(pinnedKey);
      if (pinned) return pinned;
    } catch {
      // Ignore
    }
    return systemViews[0]?.id || 'ALL';
  });

  const persistViews = useCallback(
    (nextViews: CrmSavedView[]) => {
      setViews(nextViews);
      try {
        window.localStorage.setItem(viewsKey, JSON.stringify(nextViews));
      } catch {
        // Ignore storage error
      }
    },
    [viewsKey]
  );

  const setPinnedViewId = useCallback(
    (viewId: string) => {
      setPinnedViewIdState(viewId);
      try {
        window.localStorage.setItem(pinnedKey, viewId);
      } catch {
        // Ignore storage error
      }
    },
    [pinnedKey]
  );

  const activeView = views.find((v) => v.id === activeViewId) ?? views[0] ?? systemViews[0];

  const toggleFavoriteView = useCallback(
    (viewId: string) => {
      persistViews(views.map((v) => (v.id === viewId ? { ...v, favorite: !v.favorite } : v)));
    },
    [views, persistViews]
  );

  const saveView = useCallback(
    (updated: CrmSavedView) => {
      const exists = views.some((v) => v.id === updated.id);
      const next = exists
        ? views.map((v) => (v.id === updated.id ? updated : v))
        : [...views, updated];
      persistViews(next);
      setActiveViewId(updated.id);
    },
    [views, persistViews]
  );

  const deleteView = useCallback(
    (viewId: string) => {
      const target = views.find((v) => v.id === viewId);
      if (!target || target.isSystem) return;
      const next = views.filter((v) => v.id !== viewId);
      persistViews(next);
      if (activeViewId === viewId) {
        setActiveViewId(next[0]?.id || 'ALL');
      }
      if (pinnedViewId === viewId) {
        setPinnedViewId(next[0]?.id || 'ALL');
      }
    },
    [views, persistViews, activeViewId, pinnedViewId, setPinnedViewId]
  );

  const toggleColumnOnActiveView = useCallback(
    (colKey: string) => {
      const colMeta = allColumns.find((c) => c.key === colKey);
      if (colMeta?.locked) return;
      const currentCols = activeView.columns;
      let nextCols: string[];
      if (currentCols.includes(colKey)) {
        if (currentCols.length <= 2) return;
        nextCols = currentCols.filter((k) => k !== colKey);
      } else {
        nextCols = [...currentCols, colKey];
      }
      saveView({ ...activeView, columns: nextCols });
    },
    [activeView, allColumns, saveView]
  );

  const resetActiveViewToDefault = useCallback(() => {
    const sysDefault = systemViews.find((v) => v.id === activeView.id);
    saveView({
      ...activeView,
      columns: sysDefault?.columns ?? defaultColumnKeys,
      summaryKeys: sysDefault?.summaryKeys ?? defaultSummaryKeys,
      sortField: sysDefault?.sortField ?? defaultSortField,
      sortDir: sysDefault?.sortDir ?? 'desc',
    });
  }, [activeView, systemViews, defaultColumnKeys, defaultSummaryKeys, defaultSortField, saveView]);

  return {
    views,
    activeView,
    activeViewId,
    setActiveViewId,
    pinnedViewId,
    setPinnedViewId,
    toggleFavoriteView,
    saveView,
    deleteView,
    toggleColumnOnActiveView,
    resetActiveViewToDefault,
  };
}
