export interface CrmSelectOption {
  value: string;
  label: string;
}

// ============================================================================
// 1. Dùng chung (Nhóm dịch vụ, Quy mô, Điều khoản TT, Thuế suất)
// ============================================================================

export const CRM_SERVICE_GROUPS: string[] = [
  'Sở hữu trí tuệ',
  'Doanh nghiệp',
  'Website',
  'Giấy phép',
  'Tư vấn pháp lý',
  'Đào tạo',
  'Khuyến mại',
  'Bưu chính, vận tải',
];

export const CRM_LEAD_SOURCES: string[] = [
  '1/ Quảng cáo',
  '2/ Giới thiệu',
  '3/ Kết nối sự kiện',
  '4/ Nhân sự công ty',
  '5/ Đối tác',
  '6/ Website / Landing Page',
];

export const CRM_GENDERS: string[] = ['Nữ', 'Nam', 'Khác'];

export const CRM_COMPANY_SIZES: string[] = [
  'Dưới 10 nhân sự',
  '10 - 49 nhân sự',
  '50 - 199 nhân sự',
  '200 - 499 nhân sự',
  'Trên 500 nhân sự',
];

export const CRM_PAYMENT_TERM_TYPES: string[] = [
  'Thanh toán 100% ngay khi ký',
  'Thanh toán 2 đợt (50% - 50%)',
  'Thanh toán 3 đợt theo tiến độ',
  'Công nợ cuối tháng',
  'Thỏa thuận riêng',
];

export const CRM_PROVINCES: string[] = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Bắc Ninh',
  'Hưng Yên',
  'Vĩnh Phúc',
  'Quảng Ninh',
  'Thanh Hóa',
  'Nghệ An',
  'Khánh Hòa',
  'Lâm Đồng',
  'Bà Rịa - Vũng Tàu',
  'Long An',
  'Tỉnh/TP khác',
];

export const CRM_DEPARTMENTS: string[] = [
  'Phòng Sở hữu trí tuệ',
  'Phòng Doanh nghiệp & Đầu tư',
  'Phòng Giấy phép chuyên ngành',
  'Phòng Tư vấn pháp lý thường xuyên',
  'Phòng Kinh doanh & CSKH',
];

export const CRM_UNITS: string[] = [
  'Công ty Luật TNHH Poip Legal - Trụ sở chính',
  'Chi nhánh TP. Hồ Chí Minh',
  'Văn phòng đại diện Đà Nẵng',
];

export const VAT_RATES: string[] = ['0%', '5%', '8%', '10%', 'KCT'];

// ============================================================================
// 2. Phân hệ 1 — KH Liên hệ (/crm/lead)
// ============================================================================

export const LEAD_CUSTOMER_STATUSES: string[] = [
  '1/ Chốt hợp đồng',
  '2/ Nhu cầu cao',
  '3/ Tiềm năng',
  '4/ Tiếp tục chăm sóc',
  '5/ Khảo giá/ Không còn nhu cầu',
  '6/ Không đủ điều kiện',
];

// ============================================================================
// 3. Phân hệ 2 — Khách hàng (/crm/account)
// ============================================================================

export const ACCOUNT_CUSTOMER_STATUSES: string[] = [
  'Đã chốt hợp đồng',
  'Tiềm năng',
  'Nhu cầu cao/Gấp',
  'Không còn tiềm năng',
];

export const ACCOUNT_CARE_STATUSES: string[] = [
  'Đang chăm sóc định kỳ',
  'Mới tiếp nhận bàn giao',
  'Đang thực hiện hồ sơ',
  'Chờ gia hạn / Tái tục',
  'Tạm dừng chăm sóc',
];

export const ACCOUNT_INDUSTRIES: string[] = [
  'Thương mại - Dịch vụ',
  'Sản xuất - Công nghiệp',
  'Công nghệ thông tin & Phần mềm',
  'Dược phẩm - Mỹ phẩm - TPCN',
  'Thực phẩm & Đồ uống (F&B)',
  'Giáo dục & Đào tạo',
  'Bất động sản & Xây dựng',
  'Bưu chính - Vận tải - Logistics',
  'Tài chính - Đầu tư',
  'Lĩnh vực khác',
];

export const ACCOUNT_RANKS: string[] = ['Kim cương', 'Vàng', 'Bạc', 'Tiêu chuẩn'];

// ============================================================================
// 4. Phân hệ 3 — Cơ hội HĐ (/crm/opportunity)
// ============================================================================

export const OPPORTUNITY_STAGES: string[] = [
  '1/ Liên hệ tư vấn & báo phí',
  '2/ Gửi yêu cầu về hồ sơ',
  '3/ Đã chăm sóc lại',
  '4/ Rà soát, đánh giá hồ sơ',
  '5/ KH đủ điều kiện hồ sơ',
  '6/ Gửi HĐ dự thảo cho KH',
  '7/ KH thanh toán lần 1',
];

export const OPPORTUNITY_TYPES: string[] = [
  'KH sử dụng dịch vụ lần đầu',
  'KH tiếp tục sử dụng dịch vụ',
];

// ============================================================================
// 5. Phân hệ 4 — Hợp đồng (/crm/sale-order)
// ============================================================================

export const EXECUTION_STATUSES: string[] = [
  'Chưa thực hiện',
  'Đang chuẩn bị hồ sơ',
  'Đã nộp hồ sơ lên',
  'Đã có kết quả',
  'Đã hoàn thành',
];

export const REVENUE_STATUSES: string[] = ['Bản nháp', 'Đề nghị ghi', 'Đã ghi'];

export const ARCHIVED_STATUSES: string[] = ['Chưa có', 'Đã lưu bản cứng', 'Đã lưu bản scan'];

export const CONTRACT_SOURCES: string[] = [
  'Khai thác mới',
  'Tái ký / Gia hạn',
  'Bán chéo thêm dịch vụ',
  'Đối tác giới thiệu',
  'Chuyển đổi từ Cơ hội HĐ',
];

export interface CrmSavedPreset {
  id: string;
  label: string;
}

export const CONTRACT_SAVED_PRESETS: CrmSavedPreset[] = [
  { id: 'BOOKING_THIS_WEEK', label: 'Ghi sổ tuần này' },
  { id: 'BOOKING_THIS_MONTH', label: 'Ghi sổ tháng này' },
  { id: 'ORDER_THIS_WEEK', label: 'Đặt hàng tuần này' },
  { id: 'ORDER_THIS_MONTH', label: 'Đặt hàng tháng này' },
  { id: 'PENDING_REVENUE', label: 'Đề nghị ghi doanh số' },
  { id: 'UNPAID', label: 'Còn công nợ phải thu' },
];

export const LEAD_SAVED_PRESETS: CrmSavedPreset[] = [
  { id: 'HIGH_DEMAND', label: 'Nhu cầu cao cần gọi ngay' },
  { id: 'POTENTIAL', label: 'Khách tiềm năng' },
  { id: 'CONVERTED', label: 'Đã chốt hợp đồng' },
  { id: 'FOLLOW_UP', label: 'Tiếp tục chăm sóc' },
];

export const ACCOUNT_SAVED_PRESETS: CrmSavedPreset[] = [
  { id: 'WON_CONTRACT', label: 'Đã chốt hợp đồng' },
  { id: 'URGENT_NEED', label: 'Nhu cầu cao/Gấp' },
  { id: 'POTENTIAL', label: 'Khách hàng tiềm năng' },
];

export const OPPORTUNITY_SAVED_PRESETS: CrmSavedPreset[] = [
  { id: 'DRAFT_CONTRACT', label: 'Đang gửi HĐ dự thảo' },
  { id: 'FIRST_PAYMENT', label: 'KH thanh toán lần 1' },
  { id: 'QUALIFIED', label: 'Đủ điều kiện hồ sơ' },
];

export const ACTIVITY_TYPES: CrmSelectOption[] = [
  { value: 'CALL', label: 'Gọi điện' },
  { value: 'TASK', label: 'Nhiệm vụ' },
  { value: 'MEETING', label: 'Lịch hẹn' },
  { value: 'EMAIL', label: 'Email/Ghi chú' },
];

export const CASHFLOW_TYPES: CrmSelectOption[] = [
  { value: 'THUC_THU', label: 'Thực thu' },
  { value: 'DU_KIEN_CHI', label: 'Dự kiến chi' },
  { value: 'THUC_CHI', label: 'Thực chi' },
];

export const EXPENSE_CATEGORIES: CrmSelectOption[] = [
  { value: 'DICH_VU', label: 'Chi dịch vụ' },
  { value: 'NHA_NUOC', label: 'Chi nhà nước' },
  { value: 'HO_TRO', label: 'Chi hỗ trợ' },
  { value: 'KHAC', label: 'Chi khác' },
];

export const PAYMENT_METHODS: string[] = [
  'Chuyển khoản ngân hàng',
  'Tiền mặt',
  'Ví điện tử / QR Pay',
  'Bù trừ công nợ',
];

export const CRM_PAGE_SIZES: number[] = [10, 20, 50, 100];
