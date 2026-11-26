import type { CrmFilterFieldConfig } from './CrmFilterPanel';
import {
  ACCOUNT_CARE_STATUSES,
  ACCOUNT_CUSTOMER_STATUSES,
  ACCOUNT_INDUSTRIES,
  ARCHIVED_STATUSES,
  CONTRACT_SOURCES,
  CRM_COMPANY_SIZES,
  CRM_DEPARTMENTS,
  CRM_GENDERS,
  CRM_LEAD_SOURCES,
  CRM_PAYMENT_TERM_TYPES,
  CRM_PROVINCES,
  CRM_SERVICE_GROUPS,
  EXECUTION_STATUSES,
  LEAD_CUSTOMER_STATUSES,
  OPPORTUNITY_STAGES,
  OPPORTUNITY_TYPES,
  REVENUE_STATUSES,
} from './constants';
import type { StaffUser } from './types';

export function extractAssigneeOptions(
  staffList: StaffUser[],
  extraNames: (string | null | undefined)[] = []
): string[] {
  const names = new Set<string>();
  staffList.forEach((u) => {
    const label = (u.fullName || u.username || '').trim();
    if (label) names.add(label);
  });
  extraNames.forEach((n) => {
    const label = (n || '').trim();
    if (label) names.add(label);
  });
  return Array.from(names);
}

function buildAssigneeField(
  key: string,
  label: string,
  staffNames: string[]
): CrmFilterFieldConfig {
  if (staffNames.length > 0) {
    return {
      key,
      label,
      type: 'select',
      options: staffNames,
    };
  }
  return {
    key,
    label,
    type: 'text',
  };
}

/**
 * Hợp đồng (`ContractListPage`) — 16 trường chính (đúng thứ tự cột bảng) + trường mở rộng (`Xem thêm`)
 */
export function buildContractFilterFields(staffNames: string[]): CrmFilterFieldConfig[] {
  return [
    // 16 Primary fields
    { key: 'bookingDate', label: 'Ngày ghi sổ', type: 'date' },
    { key: 'paymentDate', label: 'Ngày thanh toán', type: 'date' },
    { key: 'goodsSummary', label: 'Hàng hóa', type: 'text' },
    {
      key: 'revenueStatus',
      label: 'Tình trạng ghi doanh số',
      type: 'select',
      options: REVENUE_STATUSES,
    },
    {
      key: 'executionStatus',
      label: 'Tình trạng thực hiện HĐ',
      type: 'select',
      options: EXECUTION_STATUSES,
    },
    buildAssigneeField('assignedUserName', 'Người phụ trách', staffNames),
    { key: 'contractNumber', label: 'Số Hợp đồng', type: 'text' },
    { key: 'accountName', label: 'Khách hàng', type: 'text' },
    { key: 'orderValue', label: 'Giá trị đơn hàng', type: 'number' },
    { key: 'collectedAmount', label: 'Thực thu', type: 'number' },
    { key: 'actualExpense', label: 'Thực chi', type: 'number' },
    { key: 'plannedExpense', label: 'Dự kiến chi', type: 'number' },
    { key: 'receivableAmount', label: 'Còn phải thu', type: 'number' },
    { key: 'payableAmount', label: 'Còn phải chi', type: 'number' },
    { key: 'estimatedProfit', label: 'Dự kiến lãi lỗ', type: 'number' },
    {
      key: 'department',
      label: 'Bộ phận phụ trách',
      type: 'select',
      options: CRM_DEPARTMENTS,
    },
    // Extended fields (Xem thêm)
    { key: 'contactName', label: 'Liên hệ', type: 'text', isExtended: true },
    { key: 'accountCode', label: 'Mã khách hàng', type: 'text', isExtended: true },
    { key: 'liquidationValue', label: 'Giá trị thanh lý', type: 'number', isExtended: true },
    {
      key: 'leadSource',
      label: 'Nguồn gốc KH',
      type: 'select',
      options: CRM_LEAD_SOURCES,
      isExtended: true,
    },
    {
      key: 'contractSource',
      label: 'Nguồn gốc Hợp đồng',
      type: 'select',
      options: CONTRACT_SOURCES,
      isExtended: true,
    },
    { key: 'submissionDate', label: 'Ngày nộp hồ sơ', type: 'date', isExtended: true },
    { key: 'handoverDeadline', label: 'Hạn bàn giao KQ', type: 'date', isExtended: true },
    {
      key: 'archivedStatus',
      label: 'HĐ Lưu',
      type: 'select',
      options: ARCHIVED_STATUSES,
      isExtended: true,
    },
    {
      key: 'paymentTermType',
      label: 'Loại điều khoản TT',
      type: 'select',
      options: CRM_PAYMENT_TERM_TYPES,
      isExtended: true,
    },
    {
      key: 'parentContractNumber',
      label: 'Hợp đồng cha / liên quan',
      type: 'text',
      isExtended: true,
    },
    { key: 'serviceExpense', label: 'Chi dịch vụ', type: 'number', isExtended: true },
    { key: 'stateFeeExpense', label: 'Chi nhà nước', type: 'number', isExtended: true },
    { key: 'supportExpense', label: 'Chi hỗ trợ', type: 'number', isExtended: true },
    { key: 'productionDeadline', label: 'Hạn sản xuất', type: 'date', isExtended: true },
    {
      key: 'uninvoicedAmount',
      label: 'Giá trị chưa xuất hóa đơn',
      type: 'number',
      isExtended: true,
    },
    { key: 'taxCode', label: 'Mã số thuế', type: 'text', isExtended: true },
    { key: 'invoiceCustomerName', label: 'Khách hàng (Hóa đơn)', type: 'text', isExtended: true },
    { key: 'buyerName', label: 'Người mua hàng', type: 'text', isExtended: true },
    {
      key: 'invoiceProvince',
      label: 'Tỉnh/Thành phố (Hóa đơn)',
      type: 'select',
      options: CRM_PROVINCES,
      isExtended: true,
    },
    { key: 'invoiceDistrict', label: 'Quận/Huyện (Hóa đơn)', type: 'text', isExtended: true },
    { key: 'invoiceLookupCode', label: 'Mã tra cứu hóa đơn', type: 'text', isExtended: true },
    { key: 'unitName', label: 'Đơn vị', type: 'text', isExtended: true },
    { key: 'orderDate', label: 'Ngày đặt hàng', type: 'date', isExtended: true },
    { key: 'referrer', label: 'Đối tác/CTV giới thiệu', type: 'text', isExtended: true },
    { key: 'shared', label: 'Dùng chung', type: 'boolean', isExtended: true },
    { key: 'createdAt', label: 'Ngày tạo', type: 'date', isExtended: true },
  ];
}

/**
 * KH Liên hệ (`LeadListPage`) — 12 trường chính + 15 trường mở rộng (`Xem thêm`)
 */
export function buildLeadFilterFields(staffNames: string[]): CrmFilterFieldConfig[] {
  return [
    // 12 Primary fields
    { key: 'tags', label: 'Thẻ', type: 'text' },
    { key: 'createdAt', label: 'Ngày tạo', type: 'date' },
    {
      key: 'customerStatus',
      label: 'Trạng thái khách hàng',
      type: 'select',
      options: LEAD_CUSTOMER_STATUSES,
    },
    buildAssigneeField('assignedUserName', 'Người phụ trách', staffNames),
    { key: 'fullName', label: 'Họ và tên', type: 'text' },
    { key: 'phone', label: 'Điện thoại', type: 'text' },
    {
      key: 'serviceGroups',
      label: 'Nhóm dịch vụ',
      type: 'select',
      options: CRM_SERVICE_GROUPS,
    },
    { key: 'demandDetail', label: 'Chi tiết nhu cầu KH', type: 'text' },
    { key: 'organizationName', label: 'Tổ chức', type: 'text' },
    {
      key: 'province',
      label: 'Tỉnh/Thành phố',
      type: 'select',
      options: CRM_PROVINCES,
    },
    {
      key: 'leadSource',
      label: 'Nguồn gốc KH',
      type: 'select',
      options: CRM_LEAD_SOURCES,
    },
    { key: 'ownerUserName', label: 'Chủ sở hữu', type: 'text' },
    // 15 Extended fields
    { key: 'code', label: 'Mã tiềm năng', type: 'text', isExtended: true },
    { key: 'taxCode', label: 'Mã số thuế', type: 'text', isExtended: true },
    { key: 'personalEmail', label: 'Email cá nhân', type: 'text', isExtended: true },
    { key: 'workEmail', label: 'Email cơ quan', type: 'text', isExtended: true },
    { key: 'jobTitle', label: 'Chức danh', type: 'text', isExtended: true },
    {
      key: 'gender',
      label: 'Giới tính',
      type: 'select',
      options: CRM_GENDERS,
      isExtended: true,
    },
    { key: 'zalo', label: 'Zalo', type: 'text', isExtended: true },
    { key: 'website', label: 'Website', type: 'text', isExtended: true },
    { key: 'birthDate', label: 'Ngày sinh', type: 'date', isExtended: true },
    {
      key: 'companySize',
      label: 'Quy mô nhân sự',
      type: 'select',
      options: CRM_COMPANY_SIZES,
      isExtended: true,
    },
    { key: 'district', label: 'Quận/Huyện', type: 'text', isExtended: true },
    { key: 'address', label: 'Địa chỉ', type: 'text', isExtended: true },
    {
      key: 'department',
      label: 'Đơn vị',
      type: 'select',
      options: CRM_DEPARTMENTS,
      isExtended: true,
    },
    { key: 'shared', label: 'Dùng chung', type: 'boolean', isExtended: true },
    { key: 'lastInteractedAt', label: 'Ngày tương tác gần nhất', type: 'date', isExtended: true },
  ];
}

/**
 * Khách hàng (`AccountListPage`) — 12 trường chính + 18 trường mở rộng (`Xem thêm`)
 */
export function buildAccountFilterFields(staffNames: string[]): CrmFilterFieldConfig[] {
  return [
    // 12 Primary fields
    { key: 'createdAt', label: 'Ngày tạo', type: 'date' },
    {
      key: 'customerStatus',
      label: 'Trạng thái khách hàng',
      type: 'select',
      options: ACCOUNT_CUSTOMER_STATUSES,
    },
    {
      key: 'serviceGroups',
      label: 'Nhóm dịch vụ',
      type: 'select',
      options: CRM_SERVICE_GROUPS,
    },
    { key: 'demandDetail', label: 'Chi tiết nhu cầu KH', type: 'text' },
    buildAssigneeField('assignedUserName', 'Người phụ trách', staffNames),
    { key: 'customerName', label: 'Tên khách hàng', type: 'text' },
    { key: 'relatedUsers', label: 'Người liên quan', type: 'text' },
    { key: 'phone', label: 'Điện thoại', type: 'text' },
    { key: 'servicesSummary', label: 'Dịch vụ', type: 'text' },
    {
      key: 'careStatuses',
      label: 'Tình trạng chăm sóc KH',
      type: 'select',
      options: ACCOUNT_CARE_STATUSES,
    },
    { key: 'ownerUserName', label: 'Chủ sở hữu', type: 'text' },
    {
      key: 'billingProvince',
      label: 'Tỉnh/Thành phố (Hóa đơn)',
      type: 'select',
      options: CRM_PROVINCES,
    },
    // Extended fields
    { key: 'code', label: 'Mã khách hàng', type: 'text', isExtended: true },
    { key: 'tags', label: 'Thẻ', type: 'text', isExtended: true },
    { key: 'taxCode', label: 'Mã số thuế', type: 'text', isExtended: true },
    { key: 'email', label: 'Email', type: 'text', isExtended: true },
    {
      key: 'industries',
      label: 'Lĩnh vực/ngành nghề',
      type: 'select',
      options: ACCOUNT_INDUSTRIES,
      isExtended: true,
    },
    {
      key: 'leadSource',
      label: 'Nguồn gốc KH',
      type: 'select',
      options: CRM_LEAD_SOURCES,
      isExtended: true,
    },
    { key: 'rankLabel', label: 'Hạng khách hàng', type: 'text', isExtended: true },
    { key: 'contactName', label: 'Tên liên hệ', type: 'text', isExtended: true },
    { key: 'contactPhone', label: 'Điện thoại liên hệ', type: 'text', isExtended: true },
    { key: 'contactEmail', label: 'Email liên hệ', type: 'text', isExtended: true },
    { key: 'billingDistrict', label: 'Quận/Huyện (Hóa đơn)', type: 'text', isExtended: true },
    { key: 'billingAddress', label: 'Địa chỉ (Hóa đơn)', type: 'text', isExtended: true },
    {
      key: 'companySize',
      label: 'Quy mô nhân sự',
      type: 'select',
      options: CRM_COMPANY_SIZES,
      isExtended: true,
    },
    { key: 'foundedDate', label: 'Ngày thành lập', type: 'date', isExtended: true },
    {
      key: 'paymentTermType',
      label: 'Loại điều khoản TT',
      type: 'select',
      options: CRM_PAYMENT_TERM_TYPES,
      isExtended: true,
    },
    { key: 'annualRevenue', label: 'Doanh thu', type: 'number', isExtended: true },
    { key: 'individual', label: 'Là KH cá nhân', type: 'boolean', isExtended: true },
    { key: 'partner', label: 'Là đối tác/CTV', type: 'boolean', isExtended: true },
  ];
}

/**
 * Cơ hội HĐ (`OpportunityListPage`) — 9 trường chính + 9 trường mở rộng (`Xem thêm`)
 */
export function buildOpportunityFilterFields(staffNames: string[]): CrmFilterFieldConfig[] {
  return [
    // 9 Primary fields
    { key: 'tags', label: 'Thẻ', type: 'text' },
    { key: 'opportunityName', label: 'Tên cơ hội', type: 'text' },
    { key: 'contactName', label: 'Liên hệ', type: 'text' },
    { key: 'expectedRevenue', label: 'Số tiền', type: 'number' },
    {
      key: 'stage',
      label: 'Giai đoạn',
      type: 'select',
      options: OPPORTUNITY_STAGES,
    },
    { key: 'expectedCloseDate', label: 'Ngày kỳ vọng/kết thúc', type: 'date' },
    {
      key: 'serviceGroups',
      label: 'Loại hàng hóa',
      type: 'select',
      options: CRM_SERVICE_GROUPS,
    },
    buildAssigneeField('assignedUserName', 'Người thực hiện', staffNames),
    { key: 'createdAt', label: 'Ngày tạo', type: 'date' },
    // 9 Extended fields
    { key: 'code', label: 'Mã cơ hội', type: 'text', isExtended: true },
    { key: 'accountName', label: 'Khách hàng', type: 'text', isExtended: true },
    { key: 'contactPhone', label: 'SĐT liên hệ', type: 'text', isExtended: true },
    {
      key: 'opportunityTypes',
      label: 'Loại cơ hội',
      type: 'select',
      options: OPPORTUNITY_TYPES,
      isExtended: true,
    },
    {
      key: 'leadSource',
      label: 'Nguồn gốc KH',
      type: 'select',
      options: CRM_LEAD_SOURCES,
      isExtended: true,
    },
    { key: 'referrer', label: 'Đối tác/CTV giới thiệu', type: 'text', isExtended: true },
    { key: 'notes', label: 'Ghi chú', type: 'text', isExtended: true },
    { key: 'shared', label: 'Dùng chung', type: 'boolean', isExtended: true },
    { key: 'updatedAt', label: 'Ngày sửa', type: 'date', isExtended: true },
  ];
}
