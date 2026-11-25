import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, X } from 'lucide-react';
import { toast } from 'react-toastify';
import crmEnterpriseApi from './api';
import { OPPORTUNITY_STAGES } from './constants';
import { formatVnd } from './formatters';
import type { CrmLeadConvertResponse, CrmLeadDto } from './types';

export interface CrmConvertLeadModalProps {
  open: boolean;
  lead: CrmLeadDto | null;
  onClose: () => void;
  onConverted: (result: CrmLeadConvertResponse) => void;
}

export default function CrmConvertLeadModal({
  open,
  lead,
  onClose,
  onConverted,
}: CrmConvertLeadModalProps) {
  const [createOpportunity, setCreateOpportunity] = useState(true);
  const [opportunityName, setOpportunityName] = useState('');
  const [expectedRevenue, setExpectedRevenue] = useState(5000000);
  const [stage, setStage] = useState(OPPORTUNITY_STAGES[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (lead && open) {
      const defaultSvc =
        lead.serviceGroups && lead.serviceGroups.length > 0
          ? lead.serviceGroups.join(', ')
          : 'Tư vấn pháp lý';
      setOpportunityName(
        `Cơ hội ${defaultSvc} - ${lead.organizationName || lead.customerName || lead.fullName}`
      );
      setExpectedRevenue(5000000);
      setStage(OPPORTUNITY_STAGES[0]);
      setCreateOpportunity(true);
    }
  }, [lead, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await crmEnterpriseApi.convertLead(lead.id, {
        createOpportunity,
        opportunityName: createOpportunity ? opportunityName.trim() : undefined,
        expectedRevenue: createOpportunity ? expectedRevenue : undefined,
        stage: createOpportunity ? stage : undefined,
      });
      toast.success('Đã chuyển đổi KH Liên hệ sang Khách hàng thành công');
      onConverted(res);
    } catch {
      toast.error('Không thể chuyển đổi KH Liên hệ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chuyển đổi KH Liên hệ sang Khách hàng"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-brand-line bg-white shadow-soft"
      >
        <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-brand-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-brand-ink">
              Chuyển đổi KH Liên hệ ({lead.code})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại chuyển đổi"
            className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-lg border border-brand-line bg-brand-surface p-3.5 text-xs">
            <div className="font-semibold text-brand-ink">
              Khách hàng sẽ được tạo mới trên phân hệ Khách hàng 360°:
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-2 text-brand-muted">
              <div>
                Tên KH:{' '}
                <strong className="text-brand-ink">
                  {lead.organizationName || lead.customerName || lead.fullName}
                </strong>
              </div>
              <div className="tabular-nums">
                Điện thoại: <strong className="text-brand-ink">{lead.phone || '—'}</strong>
              </div>
              <div>
                Người liên hệ: <strong className="text-brand-ink">{lead.fullName}</strong>
              </div>
              <div>
                Nhóm dịch vụ:{' '}
                <strong className="text-brand-ink">{lead.serviceGroups?.join(', ') || '—'}</strong>
              </div>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-brand-line bg-white p-3 text-xs font-semibold text-brand-ink">
            <input
              type="checkbox"
              checked={createOpportunity}
              onChange={(e) => setCreateOpportunity(e.target.checked)}
              aria-label="Tạo kèm Cơ hội HĐ ngay khi chuyển đổi"
              className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
            />
            <span>Đồng thời khởi tạo Cơ hội HĐ (7 giai đoạn tư vấn hồ sơ)</span>
          </label>

          {createOpportunity && (
            <div className="space-y-3 rounded-lg border border-brand-line bg-white p-3.5">
              <div>
                <label
                  htmlFor="conv-opp-name"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tên cơ hội HĐ *
                </label>
                <input
                  id="conv-opp-name"
                  type="text"
                  required={createOpportunity}
                  value={opportunityName}
                  onChange={(e) => setOpportunityName(e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="conv-opp-rev"
                    className="mb-1 block text-xs font-semibold text-brand-ink"
                  >
                    Doanh số kỳ vọng (VNĐ)
                  </label>
                  <input
                    id="conv-opp-rev"
                    type="number"
                    min={0}
                    step="100000"
                    value={expectedRevenue}
                    onChange={(e) => setExpectedRevenue(Number(e.target.value))}
                    className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  />
                  <span className="mt-0.5 block text-[11px] tabular-nums text-brand-muted">
                    {formatVnd(expectedRevenue, true)}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="conv-opp-stage"
                    className="mb-1 block text-xs font-semibold text-brand-ink"
                  >
                    Giai đoạn mở đầu
                  </label>
                  <select
                    id="conv-opp-stage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    {OPPORTUNITY_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-brand-line pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-brand-line bg-white px-4 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              {submitting ? 'Đang chuyển đổi...' : 'Xác nhận chuyển đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
