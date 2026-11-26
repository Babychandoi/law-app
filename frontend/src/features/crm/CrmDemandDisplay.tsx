import React from 'react';
import { parseLeadDemandDetail } from './demandNormalizer';

export interface CrmDemandCellProps {
  value?: string | null;
  maxWidthClass?: string;
}

/**
 * Hiển thị ngắn gọn 2 dòng trên bảng Danh sách CRM:
 * - Dòng 1: Lời nhắn thật của khách hàng (hoặc tên dịch vụ cần tư vấn)
 * - Dòng 2: Đối tượng · Kênh quảng cáo · Chiến dịch (nếu là lead từ Landing Page / Ads)
 */
export function CrmDemandTableCell({ value, maxWidthClass = 'max-w-[260px]' }: CrmDemandCellProps) {
  if (!value || !value.trim()) {
    return <span className="text-brand-muted">—</span>;
  }

  const parsed = parseLeadDemandDetail(value);
  if (!parsed.structured) {
    return (
      <div className={`${maxWidthClass} truncate text-brand-ink`} title={parsed.normalizedText}>
        {parsed.headline}
      </div>
    );
  }

  return (
    <div className={maxWidthClass} title={parsed.normalizedText}>
      <div className="truncate font-medium text-brand-ink">{parsed.headline}</div>
      {parsed.subline && (
        <div className="truncate text-[11px] text-brand-muted">{parsed.subline}</div>
      )}
    </div>
  );
}

/**
 * Hiển thị chi tiết đã bóc tách rõ ràng trên trang Chi tiết Lead / Khách hàng / Modal quản trị.
 */
export function CrmDemandDetailCard({ value }: { value?: string | null }) {
  if (!value || !value.trim()) {
    return <span className="text-brand-muted">—</span>;
  }

  const parsed = parseLeadDemandDetail(value);
  if (!parsed.structured) {
    return <span className="whitespace-pre-line text-brand-ink">{value}</span>;
  }

  const metaItems: { label: string; val: string; mono?: boolean }[] = [
    { label: 'Dịch vụ đăng ký', val: parsed.serviceName },
    { label: 'Đối tượng KH', val: parsed.customerType },
    { label: 'Kênh tiếp nhận', val: parsed.channelLabel },
    { label: 'Trang đích (LP)', val: parsed.landingSource },
    { label: 'Chiến dịch UTM', val: parsed.campaignName },
    { label: 'Mẫu nội dung QC', val: parsed.adContent },
    { label: 'Mã nhóm QC', val: parsed.adTerm, mono: true },
  ].filter((item) => Boolean(item.val));

  return (
    <div className="space-y-2.5">
      {parsed.customerNote ? (
        <div className="rounded-md border border-brand-line bg-brand-surface px-3 py-2 text-xs text-brand-ink">
          <span className="font-semibold text-brand-primary">Lời nhắn KH: </span>
          <span className="whitespace-pre-line font-medium">{parsed.customerNote}</span>
        </div>
      ) : (
        <div className="text-xs font-medium text-brand-ink">{parsed.headline}</div>
      )}

      {metaItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {metaItems.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1 rounded border border-brand-line bg-white px-2 py-0.5 text-[11px] text-brand-ink"
            >
              <span className="text-brand-muted">{item.label}:</span>
              <strong className={`font-semibold ${item.mono ? 'tabular-nums' : ''}`}>
                {item.val}
              </strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
