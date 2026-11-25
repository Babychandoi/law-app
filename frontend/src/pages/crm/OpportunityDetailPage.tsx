import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, FileCheck2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../component/common/ui/Spinner';
import useConfirm from '../../component/common/ui/useConfirm';
import crmEnterpriseApi from '../../features/crm/api';
import CrmLineItemsEditor from '../../features/crm/CrmLineItemsEditor';
import CrmQuickActivityPanel from '../../features/crm/CrmQuickActivityPanel';
import { CrmAssigneePill, CrmTagList } from '../../features/crm/CrmStatusBadge';
import { OPPORTUNITY_STAGES } from '../../features/crm/constants';
import { formatDateTimeVi, formatDateVi, formatVnd } from '../../features/crm/formatters';
import type { CrmOpportunityDto } from '../../features/crm/types';
import { CRM_BASE } from './CrmWorkspaceLayout';

type OppDetailTab = 'services' | 'detail';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, confirmDialog } = useConfirm();

  const [opp, setOpp] = useState<CrmOpportunityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OppDetailTab>('services');
  const [converting, setConverting] = useState(false);

  const loadOpp = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await crmEnterpriseApi.getOpportunity(id);
      setOpp(data);
    } catch {
      toast.error('Không tìm thấy Cơ hội HĐ');
      navigate(`${CRM_BASE}/opportunity`);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadOpp();
  }, [loadOpp]);

  const handleStageSelect = async (stage: string) => {
    if (!opp || opp.stage === stage) return;
    try {
      const updated = await crmEnterpriseApi.updateOpportunityStage(opp.id, stage);
      setOpp(updated);
      toast.success(`Đã cập nhật giai đoạn: ${stage}`);
    } catch {
      toast.error('Không thể cập nhật giai đoạn');
    }
  };

  const handleConvertContract = async () => {
    if (!opp) return;
    if (opp.convertedContractId) {
      navigate(`${CRM_BASE}/sale-order/${opp.convertedContractId}`);
      return;
    }
    setConverting(true);
    try {
      const contract = await crmEnterpriseApi.convertOpportunityToContract(opp.id);
      toast.success(`Đã sinh Hợp đồng ${contract.contractNumber}`);
      navigate(`${CRM_BASE}/sale-order/${contract.id}`);
    } catch {
      toast.error('Không thể sinh hợp đồng từ cơ hội này');
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!opp) return;
    const ok = await confirm({
      title: 'Xóa Cơ hội HĐ',
      message: `Xóa cơ hội "${opp.opportunityName}" (${opp.code})?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await crmEnterpriseApi.deleteOpportunity(opp.id);
      toast.success('Đã xóa Cơ hội HĐ');
      navigate(`${CRM_BASE}/opportunity`);
    } catch {
      toast.error('Không thể xóa Cơ hội HĐ');
    }
  };

  if (loading || !opp) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Đang tải chi tiết Cơ hội HĐ" />
      </div>
    );
  }

  const currentStageIndex = OPPORTUNITY_STAGES.indexOf(opp.stage);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {confirmDialog}

      {/* Header */}
      <div className="border-b border-brand-line bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`${CRM_BASE}/opportunity`}
              aria-label="Quay lại danh sách Cơ hội HĐ"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <ArrowLeft size={15} aria-hidden="true" />
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold text-brand-ink sm:text-lg">
                  {opp.opportunityName}
                </h1>
                <span className="rounded bg-brand-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-brand-muted">
                  {opp.code}
                </span>
                <span className="text-sm font-bold tabular-nums text-[#065f46]">
                  · {formatVnd(opp.expectedRevenue, true)}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                {opp.accountId && opp.accountName ? (
                  <Link
                    to={`${CRM_BASE}/account/${opp.accountId}`}
                    className="font-semibold text-brand-primary hover:underline"
                  >
                    KH: {opp.accountName}
                  </Link>
                ) : (
                  opp.accountName && <span>KH: {opp.accountName}</span>
                )}
                <span>Kỳ vọng chốt: {formatDateVi(opp.expectedCloseDate)}</span>
                <CrmTagList tags={opp.tags} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`${CRM_BASE}/opportunity/${opp.id}/edit`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Pencil size={13} aria-hidden="true" />
              <span>Sửa</span>
            </Link>

            {opp.convertedContractId ? (
              <Link
                to={`${CRM_BASE}/sale-order/${opp.convertedContractId}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <ExternalLink size={14} aria-hidden="true" />
                <span>Xem Hợp đồng đã sinh</span>
              </Link>
            ) : (
              <button
                type="button"
                disabled={converting}
                onClick={handleConvertContract}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <FileCheck2 size={14} aria-hidden="true" />
                <span>{converting ? 'Đang sinh HĐ...' : 'Sinh hợp đồng'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDelete}
              aria-label="Xóa Cơ hội HĐ"
              className="inline-flex h-8 items-center rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-[#9f1239] hover:bg-[#ffe4e6]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 7-Stage Clickable Pipeline Stepper */}
        <div
          role="group"
          aria-label="7 giai đoạn quy trình tư vấn Cơ hội HĐ"
          className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7"
        >
          {OPPORTUNITY_STAGES.map((stage, idx) => {
            const isCurrent = stage === opp.stage;
            const isCompleted = currentStageIndex > idx;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => handleStageSelect(stage)}
                aria-pressed={isCurrent}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-left text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                  isCurrent
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : isCompleted
                      ? 'border-[#065f46]/30 bg-[#d1fae5] text-[#065f46]'
                      : 'border-brand-line bg-brand-surface text-brand-ink hover:border-brand-primary'
                }`}
              >
                {isCompleted && <Check size={12} className="shrink-0" aria-hidden="true" />}
                <span className="truncate">{stage}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-brand-line bg-white">
          <div className="flex gap-5 border-b border-brand-line px-4" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'services'}
              onClick={() => setActiveTab('services')}
              className={`border-b-2 py-3 text-xs font-semibold ${
                activeTab === 'services'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-brand-muted hover:text-brand-ink'
              }`}
            >
              Thông tin dịch vụ ({opp.items?.length ?? 0})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'detail'}
              onClick={() => setActiveTab('detail')}
              className={`border-b-2 py-3 text-xs font-semibold ${
                activeTab === 'detail'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-brand-muted hover:text-brand-ink'
              }`}
            >
              Thông tin chi tiết
            </button>
          </div>

          <div className="flex-1 p-4 sm:p-5">
            {activeTab === 'services' ? (
              <CrmLineItemsEditor items={opp.items ?? []} readOnly />
            ) : (
              <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-xs sm:grid-cols-2">
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Mã cơ hội</dt>
                  <dd className="font-semibold tabular-nums text-brand-ink">{opp.code}</dd>
                </div>
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Khách hàng</dt>
                  <dd className="font-semibold text-brand-ink">{opp.accountName || '—'}</dd>
                </div>
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Người liên hệ</dt>
                  <dd className="font-medium text-brand-ink">{opp.contactName || '—'}</dd>
                </div>
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Điện thoại liên hệ</dt>
                  <dd className="font-medium tabular-nums text-brand-ink">
                    {opp.contactPhone || '—'}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Loại cơ hội</dt>
                  <dd className="font-medium text-brand-ink">
                    {opp.opportunityTypes?.join(', ') || '—'}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Nhóm dịch vụ</dt>
                  <dd className="font-medium text-brand-ink">
                    {opp.serviceGroups?.join(', ') || '—'}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Nguồn gốc KH</dt>
                  <dd className="font-medium text-brand-ink">{opp.leadSource || '—'}</dd>
                </div>
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Người thực hiện</dt>
                  <dd>
                    <CrmAssigneePill name={opp.assignedUserName} />
                  </dd>
                </div>
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Đối tác/CTV giới thiệu</dt>
                  <dd className="font-medium text-brand-ink">{opp.referrer || '—'}</dd>
                </div>
                <div className="flex justify-between border-b border-brand-line/50 py-1.5">
                  <dt className="text-brand-muted">Ngày tạo</dt>
                  <dd className="tabular-nums text-brand-ink">{formatDateTimeVi(opp.createdAt)}</dd>
                </div>
                {opp.notes && (
                  <div className="sm:col-span-2">
                    <dt className="mb-1 text-brand-muted">Ghi chú</dt>
                    <dd className="rounded-md border border-brand-line bg-brand-surface p-3 whitespace-pre-line text-brand-ink">
                      {opp.notes}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-[360px]">
          <CrmQuickActivityPanel
            entityType="OPPORTUNITY"
            entityId={opp.id}
            entityLabel={opp.opportunityName}
            entityPhone={opp.contactPhone}
          />
        </div>
      </div>
    </div>
  );
}
