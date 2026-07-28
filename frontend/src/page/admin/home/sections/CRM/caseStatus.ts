// Nhãn tiếng Việt + màu cho trạng thái vụ việc (Status enum của monolith).
export const CASE_STATUS_VI: Record<string, { label: string; cls: string }> = {
  NEW: { label: 'Mới', cls: 'bg-blue-100 text-blue-700' },
  RECEIVED: { label: 'Đã tiếp nhận', cls: 'bg-cyan-100 text-cyan-700' },
  PROCESSING: { label: 'Đang xử lý', cls: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
  CANCELED: { label: 'Đã hủy', cls: 'bg-gray-200 text-gray-600' },
};

export const CASE_STATUS_OPTIONS = Object.keys(CASE_STATUS_VI);

export const caseStatusLabel = (s: string | null): string =>
  s ? (CASE_STATUS_VI[s]?.label ?? s) : '—';
