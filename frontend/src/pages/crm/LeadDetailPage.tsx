import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRightLeft,
  Building2,
  ExternalLink,
  Pencil,
  Phone,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../component/common/ui/Spinner';
import useConfirm from '../../component/common/ui/useConfirm';
import crmEnterpriseApi from '../../features/crm/api';
import CrmConvertLeadModal from '../../features/crm/CrmConvertLeadModal';
import { CrmDemandDetailCard } from '../../features/crm/CrmDemandDisplay';
import CrmQuickActivityPanel from '../../features/crm/CrmQuickActivityPanel';
import CrmStatusBadge, { CrmAssigneePill, CrmTagList } from '../../features/crm/CrmStatusBadge';
import { formatDateTimeVi, formatDateVi } from '../../features/crm/formatters';
import type { CrmLeadDto } from '../../features/crm/types';
import { CRM_BASE } from './CrmWorkspaceLayout';

type LeadTab = 'detail' | 'demand' | 'services';

interface FieldPair {
  label: string;
  value: React.ReactNode;
  rawText?: string;
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, confirmDialog } = useConfirm();

  const [lead, setLead] = useState<CrmLeadDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeadTab>('detail');
  const [fieldQuery, setFieldQuery] = useState('');
  const [showEmptyFields, setShowEmptyFields] = useState(true);
  const [showConvert, setShowConvert] = useState(false);

  const loadLead = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await crmEnterpriseApi.getLead(id);
      setLead(data);
    } catch {
      toast.error('Không tìm thấy KH Liên hệ');
      navigate(`${CRM_BASE}/lead`);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const handleDelete = async () => {
    if (!lead) return;
    const ok = await confirm({
      title: 'Xóa KH Liên hệ',
      message: `Bạn có chắc chắn muốn xóa "${lead.fullName || lead.customerName}" (${lead.code})?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await crmEnterpriseApi.deleteLead(lead.id);
      toast.success('Đã xóa KH Liên hệ');
      navigate(`${CRM_BASE}/lead`);
    } catch {
      toast.error('Không thể xóa KH Liên hệ');
    }
  };

  const sections = useMemo(() => {
    if (!lead) return [];
    const build = (title: string, items: FieldPair[]) => {
      const q = fieldQuery.trim().toLowerCase();
      const filtered = items.filter((it) => {
        if (!showEmptyFields && (!it.rawText || it.rawText === '—')) return false;
        if (!q) return true;
        return it.label.toLowerCase().includes(q) || (it.rawText ?? '').toLowerCase().includes(q);
      });
      return { title, items: filtered };
    };

    return [
      build('Thông tin chung', [
        { label: 'Tên khách hàng', value: lead.customerName || '—', rawText: lead.customerName },
        { label: 'Họ và tên', value: lead.fullName || '—', rawText: lead.fullName },
        {
          label: 'Điện thoại',
          value: lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1 font-medium tabular-nums text-brand-primary hover:underline"
            >
              <Phone size={13} aria-hidden="true" />
              <span>{lead.phone}</span>
            </a>
          ) : (
            '—'
          ),
          rawText: lead.phone,
        },
        {
          label: 'Mã số thuế',
          value: <span className="tabular-nums">{lead.taxCode || '—'}</span>,
          rawText: lead.taxCode || '',
        },
        {
          label: 'Email cá nhân',
          value: lead.personalEmail || '—',
          rawText: lead.personalEmail || '',
        },
        { label: 'Email cơ quan', value: lead.workEmail || '—', rawText: lead.workEmail || '' },
        {
          label: 'Nhóm dịch vụ',
          value: lead.serviceGroups?.length ? lead.serviceGroups.join(', ') : '—',
          rawText: lead.serviceGroups?.join(', ') || '',
        },
        { label: 'Chức danh', value: lead.jobTitle || '—', rawText: lead.jobTitle || '' },
        {
          label: 'Người phụ trách',
          value: <CrmAssigneePill name={lead.assignedUserName} />,
          rawText: lead.assignedUserName || '',
        },
        { label: 'Nguồn gốc KH', value: lead.leadSource || '—', rawText: lead.leadSource || '' },
        {
          label: 'Trạng thái khách hàng',
          value: <CrmStatusBadge status={lead.customerStatus} />,
          rawText: lead.customerStatus,
        },
      ]),
      build('Thông tin nhu cầu KH', [
        {
          label: 'Chi tiết nhu cầu KH',
          value: <CrmDemandDetailCard value={lead.demandDetail} />,
          rawText: lead.demandDetail || '',
        },
      ]),
      build('Thông tin tổ chức và đầu mối liên hệ', [
        {
          label: 'Tổ chức',
          value: lead.organizationName || '—',
          rawText: lead.organizationName || '',
        },
        { label: 'Giới tính', value: lead.gender || '—', rawText: lead.gender || '' },
        {
          label: 'Zalo',
          value: <span className="tabular-nums">{lead.zalo || '—'}</span>,
          rawText: lead.zalo || '',
        },
        { label: 'Website', value: lead.website || '—', rawText: lead.website || '' },
        {
          label: 'Ngày sinh',
          value: <span className="tabular-nums">{formatDateVi(lead.birthDate)}</span>,
          rawText: lead.birthDate || '',
        },
        {
          label: 'Quy mô nhân sự',
          value: lead.companySize || '—',
          rawText: lead.companySize || '',
        },
      ]),
      build('Thông tin địa chỉ', [
        {
          label: 'Quốc gia',
          value: lead.country || 'Việt Nam',
          rawText: lead.country || 'Việt Nam',
        },
        { label: 'Tỉnh/Thành phố', value: lead.province || '—', rawText: lead.province || '' },
        { label: 'Quận/Huyện', value: lead.district || '—', rawText: lead.district || '' },
        { label: 'Địa chỉ', value: lead.address || '—', rawText: lead.address || '' },
      ]),
      build('Thông tin hệ thống', [
        {
          label: 'Mã tiềm năng',
          value: <span className="tabular-nums">{lead.code}</span>,
          rawText: lead.code,
        },
        {
          label: 'Dùng chung',
          value: lead.shared ? 'Có' : 'Không',
          rawText: lead.shared ? 'Có' : 'Không',
        },
        {
          label: 'Chủ sở hữu',
          value: lead.ownerUserName || '—',
          rawText: lead.ownerUserName || '',
        },
        {
          label: 'Đơn vị / Phòng ban',
          value: lead.department || '—',
          rawText: lead.department || '',
        },
        {
          label: 'Ngày tạo',
          value: <span className="tabular-nums">{formatDateTimeVi(lead.createdAt)}</span>,
          rawText: lead.createdAt || '',
        },
        {
          label: 'Cập nhật gần nhất',
          value: <span className="tabular-nums">{formatDateTimeVi(lead.updatedAt)}</span>,
          rawText: lead.updatedAt || '',
        },
      ]),
    ].filter((s) => s.items.length > 0);
  }, [lead, fieldQuery, showEmptyFields]);

  if (loading || !lead) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Đang tải chi tiết KH Liên hệ" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {confirmDialog}

      {/* Detail Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`${CRM_BASE}/lead`}
            aria-label="Quay lại danh sách KH Liên hệ"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-brand-ink sm:text-lg">
                {lead.fullName || lead.customerName}
              </h1>
              <span className="rounded bg-brand-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-brand-muted">
                {lead.code}
              </span>
              <CrmStatusBadge status={lead.customerStatus} />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
              {lead.organizationName && (
                <span className="inline-flex items-center gap-1">
                  <Building2 size={12} aria-hidden="true" />
                  <span>{lead.organizationName}</span>
                </span>
              )}
              {lead.phone && <span className="tabular-nums">SĐT: {lead.phone}</span>}
              <CrmTagList tags={lead.tags} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`${CRM_BASE}/lead/${lead.id}/edit`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Pencil size={13} aria-hidden="true" />
            <span>Sửa</span>
          </Link>

          {lead.convertedAccountId ? (
            <Link
              to={`${CRM_BASE}/account/${lead.convertedAccountId}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span>Xem Khách hàng đã chuyển đổi</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowConvert(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <ArrowRightLeft size={14} aria-hidden="true" />
              <span>Chuyển đổi</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            aria-label="Xóa KH Liên hệ"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-[#9f1239] hover:bg-[#ffe4e6]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Trash2 size={13} aria-hidden="true" />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Body 2-column MISA Workspace */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-brand-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line px-4">
            <div role="tablist" aria-label="Chi tiết KH Liên hệ" className="flex gap-5">
              {(
                [
                  { id: 'detail', label: 'Thông tin chi tiết' },
                  { id: 'demand', label: 'Ghi chú & Nhu cầu' },
                  { id: 'services', label: 'Hàng hóa quan tâm' },
                ] as { id: LeadTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 py-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                    activeTab === tab.id
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-brand-muted hover:text-brand-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'detail' && (
              <div className="flex flex-wrap items-center gap-3 py-2">
                <div className="relative">
                  <Search
                    size={13}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={fieldQuery}
                    onChange={(e) => setFieldQuery(e.target.value)}
                    placeholder="Tìm kiếm trường..."
                    aria-label="Tìm kiếm trường thông tin"
                    className="h-7 rounded-md border border-brand-line bg-brand-surface pl-7 pr-2.5 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-brand-muted">
                  <input
                    type="checkbox"
                    checked={showEmptyFields}
                    onChange={(e) => setShowEmptyFields(e.target.checked)}
                    aria-label="Hiển thị dữ liệu trống"
                    className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Hiển thị dữ liệu trống</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6 p-4 sm:p-5">
            {activeTab === 'detail' &&
              sections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h2 className="border-b border-brand-line pb-1.5 text-sm font-semibold text-brand-ink">
                    {section.title}
                  </h2>
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 text-xs sm:grid-cols-2">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="grid grid-cols-12 items-baseline gap-2 border-b border-brand-line/50 py-1.5"
                      >
                        <dt className="col-span-5 font-medium text-brand-muted">{item.label}</dt>
                        <dd className="col-span-7 font-medium text-brand-ink">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}

            {activeTab === 'demand' && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-brand-ink">
                  Nội dung nhu cầu tư vấn pháp lý của khách hàng
                </h2>
                <div className="rounded-lg border border-brand-line bg-brand-surface/50 p-4 text-xs leading-relaxed text-brand-ink">
                  {lead.demandDetail ? (
                    <CrmDemandDetailCard value={lead.demandDetail} />
                  ) : (
                    <p className="text-brand-muted">Chưa ghi nhận chi tiết nhu cầu.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-brand-ink">Nhóm dịch vụ quan tâm</h2>
                {lead.serviceGroups?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.serviceGroups.map((svc) => (
                      <span
                        key={svc}
                        className="rounded-full border border-brand-line bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-ink"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-muted">
                    Chưa chọn nhóm dịch vụ pháp lý quan tâm.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Activity Timeline */}
        <div className="w-full shrink-0 lg:w-[360px]">
          <CrmQuickActivityPanel
            entityType="LEAD"
            entityId={lead.id}
            entityLabel={lead.fullName || lead.customerName}
            entityPhone={lead.phone}
          />
        </div>
      </div>

      <CrmConvertLeadModal
        open={showConvert}
        lead={lead}
        onClose={() => setShowConvert(false)}
        onConverted={(res) => {
          setShowConvert(false);
          navigate(`${CRM_BASE}/account/${res.accountId}`);
        }}
      />
    </div>
  );
}
