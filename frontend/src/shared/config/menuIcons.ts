import {
  AlertTriangle,
  Award,
  Barcode,
  Briefcase,
  Building2,
  Copyright,
  FileText,
  Lightbulb,
  Scale,
  Share2,
  Shield,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

/** Tên icon (lưu trong DB) → component lucide, dùng cho nhóm dịch vụ động trên navbar. */
export const dynamicIconMap: Record<string, LucideIcon> = {
  shield: Shield,
  scale: Scale,
  award: Award,
  copyright: Copyright,
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  barcode: Barcode,
  building: Building2,
  share: Share2,
  briefcase: Briefcase,
  file: FileText,
  alert: AlertTriangle,
};

/** Danh sách icon cho admin chọn khi tạo nhóm dịch vụ. */
export const iconOptions: { value: string; label: string }[] = [
  { value: 'shield', label: 'Khiên (bảo hộ)' },
  { value: 'scale', label: 'Cán cân (pháp lý)' },
  { value: 'award', label: 'Huy chương' },
  { value: 'copyright', label: 'Bản quyền' },
  { value: 'sparkles', label: 'Tia sáng' },
  { value: 'lightbulb', label: 'Bóng đèn (sáng chế)' },
  { value: 'barcode', label: 'Mã vạch' },
  { value: 'building', label: 'Tòa nhà (doanh nghiệp)' },
  { value: 'share', label: 'Chia sẻ (mạng XH)' },
  { value: 'briefcase', label: 'Cặp tài liệu' },
  { value: 'file', label: 'Hồ sơ' },
  { value: 'alert', label: 'Cảnh báo (vi phạm)' },
];
