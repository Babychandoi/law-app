import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../component/common/ui/Spinner';
import crmEnterpriseApi from '../../features/crm/api';
import CrmLineItemsEditor from '../../features/crm/CrmLineItemsEditor';
import CrmMultiSelectChips from '../../features/crm/CrmMultiSelectChips';
import {
  CRM_LEAD_SOURCES,
  CRM_SERVICE_GROUPS,
  OPPORTUNITY_STAGES,
  OPPORTUNITY_TYPES,
} from '../../features/crm/constants';
import {
  calculateLineItemsTotal,
  formatVnd,
  toDateInputValue,
} from '../../features/crm/formatters';
import type {
  CrmAccountDto,
  CrmLineItemDto,
  CrmOpportunityWritePayload,
} from '../../features/crm/types';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

const INITIAL_OPP: CrmOpportunityWritePayload = {
  code: '',
  opportunityName: '',
  accountId: '',
  accountName: '',
  contactName: '',
  contactPhone: '',
  expectedRevenue: 0,
  stage: OPPORTUNITY_STAGES[0],
  expectedCloseDate: '',
  opportunityTypes: [OPPORTUNITY_TYPES[0]],
  serviceGroups: ['Sở hữu trí tuệ'],
  leadSource: CRM_LEAD_SOURCES[0],
  assignedUserId: '',
  shared: false,
  referrer: '',
  notes: '',
  tags: [],
  items: [],
};

export default function OpportunityFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const prefillAccountId = searchParams.get('accountId');
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { me, staffList } = useCrmWorkspace();

  const [form, setForm] = useState<CrmOpportunityWritePayload>(INITIAL_OPP);
  const [accounts, setAccounts] = useState<CrmAccountDto[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    crmEnterpriseApi
      .listAccounts({ page: 0, size: 100 })
      .then((res) => {
        if (active) setAccounts(res.rows);
      })
      .catch(() => {
        if (active) setAccounts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEdit && me) {
      setForm((prev) => ({
        ...prev,
        assignedUserId: prev.assignedUserId || me.id,
      }));
    }
  }, [isEdit, me]);

  useEffect(() => {
    if (isEdit || !prefillAccountId) return;
    let active = true;
    crmEnterpriseApi
      .getAccount(prefillAccountId)
      .then((acc) => {
        if (!active) return;
        setForm((prev) => ({
          ...prev,
          accountId: acc.id,
          accountName: acc.customerName,
          contactName: acc.contactName || acc.customerName,
          contactPhone: acc.contactPhone || acc.phone,
          serviceGroups: acc.serviceGroups?.length ? acc.serviceGroups : prev.serviceGroups,
          leadSource: acc.leadSource || prev.leadSource,
          opportunityName: prev.opportunityName || `Cơ hội tư vấn - ${acc.customerName}`,
        }));
      })
      .catch(() => {
        // Ignore prefill error
      });
    return () => {
      active = false;
    };
  }, [isEdit, prefillAccountId]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    crmEnterpriseApi
      .getOpportunity(id)
      .then((data) => {
        if (!active) return;
        setForm({
          ...data,
          expectedCloseDate: toDateInputValue(data.expectedCloseDate),
        });
      })
      .catch(() => {
        toast.error('Không tải được Cơ hội HĐ');
        navigate(`${CRM_BASE}/opportunity`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const setField = <K extends keyof CrmOpportunityWritePayload>(
    key: K,
    value: CrmOpportunityWritePayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAccountSelect = (selectedId: string) => {
    const found = accounts.find((a) => a.id === selectedId);
    if (!found) {
      setField('accountId', selectedId);
      return;
    }
    setForm((prev) => ({
      ...prev,
      accountId: found.id,
      accountName: found.customerName,
      contactName: prev.contactName || found.contactName || found.customerName,
      contactPhone: prev.contactPhone || found.contactPhone || found.phone,
    }));
  };

  const handleItemsChange = (nextItems: CrmLineItemDto[]) => {
    const totals = calculateLineItemsTotal(nextItems);
    setForm((prev) => ({
      ...prev,
      items: nextItems,
      expectedRevenue: nextItems.length > 0 ? totals.grandTotal : prev.expectedRevenue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.opportunityName?.trim()) {
      toast.error('Vui lòng nhập Tên cơ hội HĐ');
      return;
    }

    const assignedStaff = staffList.find((u) => u.id === form.assignedUserId);
    const payload: CrmOpportunityWritePayload = {
      ...form,
      opportunityName: form.opportunityName.trim(),
      assignedUserName: assignedStaff?.fullName || form.assignedUserName,
      expectedCloseDate: form.expectedCloseDate || null,
    };

    setSaving(true);
    try {
      const saved =
        isEdit && id
          ? await crmEnterpriseApi.updateOpportunity(id, payload)
          : await crmEnterpriseApi.createOpportunity(payload);
      toast.success(isEdit ? 'Đã cập nhật Cơ hội HĐ' : 'Đã tạo mới Cơ hội HĐ');
      navigate(`${CRM_BASE}/opportunity/${saved.id}`);
    } catch {
      toast.error('Không thể lưu Cơ hội HĐ. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Đang tải biểu mẫu Cơ hội HĐ" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Link
            to={isEdit && id ? `${CRM_BASE}/opportunity/${id}` : `${CRM_BASE}/opportunity`}
            aria-label="Quay lại"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>
          <h1 className="text-base font-bold text-brand-ink sm:text-lg">
            {isEdit ? `Sửa Cơ hội HĐ (${form.code || ''})` : 'Thêm mới Cơ hội HĐ'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={isEdit && id ? `${CRM_BASE}/opportunity/${id}` : `${CRM_BASE}/opportunity`}
            className="inline-flex h-8 items-center rounded-md border border-brand-line bg-white px-3.5 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-4 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Save size={14} aria-hidden="true" />
            <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-5">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* Thông tin chung */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin chung
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="opp-name"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tên cơ hội HĐ <span className="text-[#9f1239]">*</span>
                </label>
                <input
                  id="opp-name"
                  type="text"
                  required
                  value={form.opportunityName || ''}
                  onChange={(e) => setField('opportunityName', e.target.value)}
                  placeholder="Ví dụ: Đăng ký nhãn hiệu & bản quyền logo - Công ty TNHH ABC"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="opp-account"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Khách hàng
                </label>
                <select
                  id="opp-account"
                  value={form.accountId || ''}
                  onChange={(e) => handleAccountSelect(e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn khách hàng có sẵn --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} — {acc.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="opp-revenue"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Doanh số kỳ vọng (VNĐ) <span className="text-[#9f1239]">*</span>
                </label>
                <input
                  id="opp-revenue"
                  type="number"
                  min={0}
                  step="any"
                  value={form.expectedRevenue ?? 0}
                  onChange={(e) => setField('expectedRevenue', Number(e.target.value))}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
                <span className="mt-0.5 block text-[11px] tabular-nums text-brand-muted">
                  {formatVnd(form.expectedRevenue, true)}
                </span>
              </div>

              <div>
                <label
                  htmlFor="opp-stage"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Giai đoạn <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="opp-stage"
                  value={form.stage || OPPORTUNITY_STAGES[0]}
                  onChange={(e) => setField('stage', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {OPPORTUNITY_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="opp-closeDate"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Ngày kỳ vọng / kết thúc
                </label>
                <input
                  id="opp-closeDate"
                  type="date"
                  value={form.expectedCloseDate || ''}
                  onChange={(e) => setField('expectedCloseDate', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="opp-contactName"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Người liên hệ
                </label>
                <input
                  id="opp-contactName"
                  type="text"
                  value={form.contactName || ''}
                  onChange={(e) => setField('contactName', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="opp-contactPhone"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Điện thoại liên hệ
                </label>
                <input
                  id="opp-contactPhone"
                  type="tel"
                  value={form.contactPhone || ''}
                  onChange={(e) => setField('contactPhone', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="opp-source"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Nguồn gốc KH
                </label>
                <select
                  id="opp-source"
                  value={form.leadSource || ''}
                  onChange={(e) => setField('leadSource', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn nguồn gốc --</option>
                  {CRM_LEAD_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="opp-assigned"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Người thực hiện
                </label>
                <select
                  id="opp-assigned"
                  value={form.assignedUserId || ''}
                  onChange={(e) => setField('assignedUserId', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn người thực hiện --</option>
                  {staffList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <CrmMultiSelectChips
                  label="Loại cơ hội"
                  required
                  options={OPPORTUNITY_TYPES}
                  selected={form.opportunityTypes ?? []}
                  onChange={(opportunityTypes) => setField('opportunityTypes', opportunityTypes)}
                />
              </div>

              <div className="sm:col-span-2">
                <CrmMultiSelectChips
                  label="Nhóm dịch vụ"
                  required
                  options={CRM_SERVICE_GROUPS}
                  selected={form.serviceGroups ?? []}
                  onChange={(serviceGroups) => setField('serviceGroups', serviceGroups)}
                />
              </div>
            </div>
          </section>

          {/* Thông tin dịch vụ (Line Items) */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-3 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin hàng hóa / dịch vụ dự kiến
            </h2>
            <CrmLineItemsEditor items={form.items ?? []} onChange={handleItemsChange} />
          </section>

          {/* Thông tin hệ thống */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin hệ thống
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="opp-code"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Mã cơ hội
                </label>
                <input
                  id="opp-code"
                  type="text"
                  value={form.code || ''}
                  onChange={(e) => setField('code', e.target.value)}
                  placeholder="Để trống tự sinh mã CH..."
                  className="w-full rounded-md border border-brand-line bg-brand-surface px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="opp-referrer"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Đối tác / CTV giới thiệu
                </label>
                <input
                  id="opp-referrer"
                  type="text"
                  value={form.referrer || ''}
                  onChange={(e) => setField('referrer', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-brand-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(form.shared)}
                    onChange={(e) => setField('shared', e.target.checked)}
                    aria-label="Dùng chung"
                    className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Dùng chung</span>
                </label>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="opp-notes"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Ghi chú nội bộ
                </label>
                <textarea
                  id="opp-notes"
                  rows={2}
                  value={form.notes || ''}
                  onChange={(e) => setField('notes', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white p-3 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
