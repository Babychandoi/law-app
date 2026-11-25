import React from 'react';
import { User } from 'lucide-react';

export type CrmBadgeTone = 'emerald' | 'amber' | 'sky' | 'rose' | 'slate' | 'violet' | 'teal';

const TONE_CLASSES: Record<CrmBadgeTone, string> = {
  emerald: 'bg-[#d1fae5] text-[#065f46]',
  amber: 'bg-[#fef3c7] text-[#92400e]',
  sky: 'bg-[#e0f2fe] text-[#075985]',
  rose: 'bg-[#ffe4e6] text-[#9f1239]',
  slate: 'bg-[#e2e8f0] text-[#1b2a3a]',
  violet: 'bg-[#ede9fe] text-[#5b21b6]',
  teal: 'bg-[#ccfbf1] text-[#115e59]',
};

export function resolveStatusTone(status?: string | null): CrmBadgeTone {
  if (!status) return 'slate';
  const s = status.toLowerCase();

  if (
    s.includes('đã ghi') ||
    s.includes('đã hoàn thành') ||
    s.includes('đã có kết quả') ||
    s.includes('đã chốt') ||
    s.includes('thanh toán lần 1') ||
    s.includes('1/ chốt hợp đồng')
  ) {
    return 'emerald';
  }

  if (s.includes('nhu cầu cao') || s.includes('gấp')) {
    return 'rose';
  }

  if (
    s.includes('đề nghị ghi') ||
    s.includes('đã nộp hồ sơ') ||
    s.includes('gửi hđ dự thảo') ||
    s.includes('đủ điều kiện')
  ) {
    return 'sky';
  }

  if (
    s.includes('chuẩn bị hồ sơ') ||
    s.includes('rà soát') ||
    s.includes('gửi yêu cầu') ||
    s.includes('chờ gia hạn')
  ) {
    return 'amber';
  }

  if (
    s.includes('tiếp tục chăm sóc') ||
    s.includes('đã chăm sóc') ||
    s.includes('chăm sóc định kỳ')
  ) {
    return 'violet';
  }

  if (s.includes('tiềm năng') && !s.includes('không còn tiềm năng')) {
    return 'teal';
  }

  return 'slate';
}

export function CrmStatusBadge({
  status,
  tone,
  className = '',
}: {
  status?: string | null;
  tone?: CrmBadgeTone;
  className?: string;
}) {
  if (!status) {
    return <span className="text-xs text-brand-muted">—</span>;
  }
  const resolved = tone ?? resolveStatusTone(status);
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 ${TONE_CLASSES[resolved]} ${className}`}
    >
      {status}
    </span>
  );
}

export function CrmAssigneePill({
  name,
  className = '',
}: {
  name?: string | null;
  className?: string;
}) {
  if (!name) {
    return <span className="text-xs text-brand-muted">Chưa phân công</span>;
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-brand-line bg-brand-surface px-2.5 py-0.5 text-xs font-medium text-brand-ink ${className}`}
    >
      <User size={12} className="shrink-0 text-brand-primary" aria-hidden="true" />
      <span className="max-w-[140px] truncate">{name}</span>
    </span>
  );
}

export function CrmTagList({ tags }: { tags?: string[] | null }) {
  if (!tags || tags.length === 0) {
    return <span className="text-xs text-brand-muted">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded bg-[#fff1cc] px-2 py-0.5 text-[11px] font-medium text-brand-ink"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default CrmStatusBadge;
