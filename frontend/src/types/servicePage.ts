import { Hero, PricingPlan, Process } from './service';

/** Một mục trong section nội dung chung */
export interface ServiceSectionItem {
  id?: string;
  title?: string;
  description?: string;
  /** comparison: cột B */
  secondary?: string;
  icon?: string;
  image?: string;
  sortOrder?: number;
}

/** Kiểu hiển thị section — quyết định cách render ở trang dịch vụ động */
export type ServiceSectionType =
  | 'info' // đoạn văn + ảnh (tùy chọn)
  | 'benefits' // lưới lợi ích icon + tiêu đề + mô tả
  | 'cards' // lưới thẻ có ảnh
  | 'conditions' // danh sách điều kiện / checklist
  | 'faq' // hỏi đáp accordion
  | 'comparison'; // bảng so sánh 2 cột

export interface ServiceSection {
  id?: string;
  type: ServiceSectionType | string;
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  sortOrder?: number;
  items?: ServiceSectionItem[];
}

/** Toàn bộ dữ liệu một trang dịch vụ (API /service/page) */
export interface ServicePageData {
  id: string;
  title: string;
  href: string;
  description?: string;
  image?: string;
  hero?: Hero | null;
  sections?: ServiceSection[];
  process?: Process[];
  pricing?: PricingPlan[];
}
