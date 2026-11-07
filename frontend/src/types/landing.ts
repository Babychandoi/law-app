import { ServicePageData } from './servicePage';

/**
 * Cấu hình riêng của một landing page. Nội dung thân trang không nằm ở đây — landing render lại
 * chính `ServicePageData` của dịch vụ, nên sửa trang dịch vụ là landing đổi theo.
 */
export interface LandingPageConfig {
  id: string;
  slug: string;
  published: boolean;
  /** Dịch vụ thu lead — gửi kèm khi khách gửi form, không đoán theo tên nữa. */
  serviceId: string;
  serviceTitle: string;
  serviceHref: string;
  eyebrow?: string;
  heroPoints?: string[];
  formTitle?: string;
  formSubtitle?: string;
  finalCtaTitle?: string;
  finalCtaSubtitle?: string;
  updatedAt?: string;
}

/** Payload tạo/sửa landing. `serviceId` chỉ dùng khi tạo mới. */
export interface LandingPagePayload {
  serviceId?: string;
  slug?: string;
  published?: boolean;
  eyebrow?: string;
  heroPoints?: string[];
  formTitle?: string;
  formSubtitle?: string;
  finalCtaTitle?: string;
  finalCtaSubtitle?: string;
}

export interface LandingPageView {
  landing: LandingPageConfig;
  page: ServicePageData;
}
