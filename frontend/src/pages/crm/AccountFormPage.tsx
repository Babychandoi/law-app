import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../component/common/ui/Spinner';
import crmEnterpriseApi from '../../features/crm/api';
import CrmMultiSelectChips from '../../features/crm/CrmMultiSelectChips';
import {
  ACCOUNT_CARE_STATUSES,
  ACCOUNT_CUSTOMER_STATUSES,
  ACCOUNT_INDUSTRIES,
  ACCOUNT_RANKS,
  CRM_COMPANY_SIZES,
  CRM_LEAD_SOURCES,
  CRM_PAYMENT_TERM_TYPES,
  CRM_PROVINCES,
  CRM_SERVICE_GROUPS,
} from '../../features/crm/constants';
import { toDateInputValue } from '../../features/crm/formatters';
import type { CrmAccountWritePayload } from '../../features/crm/types';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

const INITIAL_ACCOUNT: CrmAccountWritePayload = {
  code: '',
  customerName: '',
  phone: '',
  careStatuses: ['Đang chăm sóc định kỳ'],
  customerStatus: ACCOUNT_CUSTOMER_STATUSES[1],
  lostReason: '',
  leadSource: CRM_LEAD_SOURCES[0],
  assignedUserId: '',
  ownerUserId: '',
  relatedUsers: [],
  serviceGroups: ['Sở hữu trí tuệ'],
  servicesSummary: '',
  taxCode: '',
  industries: [],
  email: '',
  rankLabel: ACCOUNT_RANKS[3],
  contactName: '',
  contactTitle: '',
  contactPhone: '',
  contactEmail: '',
  contactBirthDate: '',
  demandDetail: '',
  billingProvince: 'Hà Nội',
  billingDistrict: '',
  billingAddress: '',
  companySize: '',
  foundedDate: '',
  paymentTermType: CRM_PAYMENT_TERM_TYPES[0],
  website: '',
  annualRevenue: 0,
  shared: false,
  individual: false,
  partner: false,
  referrer: '',
  tags: [],
};

export default function AccountFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { me, staffList } = useCrmWorkspace();

  const [form, setForm] = useState<CrmAccountWritePayload>(INITIAL_ACCOUNT);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit && me) {
      setForm((prev) => ({
        ...prev,
        assignedUserId: prev.assignedUserId || me.id,
        ownerUserId: prev.ownerUserId || me.id,
      }));
    }
  }, [isEdit, me]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    crmEnterpriseApi
      .getAccount(id)
      .then((data) => {
        if (!active) return;
        setForm({
          ...data,
          contactBirthDate: toDateInputValue(data.contactBirthDate),
          foundedDate: toDateInputValue(data.foundedDate),
        });
      })
      .catch(() => {
        toast.error('Không tải được thông tin Khách hàng');
        navigate(`${CRM_BASE}/account`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const setField = <K extends keyof CrmAccountWritePayload>(
    key: K,
    value: CrmAccountWritePayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName?.trim() || !form.phone?.trim()) {
      toast.error('Vui lòng nhập Tên khách hàng và Điện thoại');
      return;
    }
    if (!form.demandDetail?.trim()) {
      toast.error('Vui lòng nhập Chi tiết nhu cầu KH');
      return;
    }

    const assignedStaff = staffList.find((u) => u.id === form.assignedUserId);
    const ownerStaff = staffList.find((u) => u.id === form.ownerUserId);

    const payload: CrmAccountWritePayload = {
      ...form,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      assignedUserName: assignedStaff?.fullName || form.assignedUserName,
      ownerUserName: ownerStaff?.fullName || form.ownerUserName,
      contactBirthDate: form.contactBirthDate || null,
      foundedDate: form.foundedDate || null,
    };

    setSaving(true);
    try {
      const saved =
        isEdit && id
          ? await crmEnterpriseApi.updateAccount(id, payload)
          : await crmEnterpriseApi.createAccount(payload);
      toast.success(isEdit ? 'Đã cập nhật Khách hàng' : 'Đã tạo mới Khách hàng');
      navigate(`${CRM_BASE}/account/${saved.id}`);
    } catch {
      toast.error('Không thể lưu Khách hàng. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Đang tải biểu mẫu Khách hàng" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Link
            to={isEdit && id ? `${CRM_BASE}/account/${id}` : `${CRM_BASE}/account`}
            aria-label="Quay lại"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>
          <h1 className="text-base font-bold text-brand-ink sm:text-lg">
            {isEdit ? `Sửa Khách hàng (${form.code || ''})` : 'Thêm mới Khách hàng'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={isEdit && id ? `${CRM_BASE}/account/${id}` : `${CRM_BASE}/account`}
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

      {/* 6 MISA Sections */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-5">
        <div className="mx-auto max-w-5xl space-y-4">
          {/* 1. Thông tin chung */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin chung
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="acc-code"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Mã khách hàng
                </label>
                <input
                  id="acc-code"
                  type="text"
                  value={form.code || ''}
                  onChange={(e) => setField('code', e.target.value)}
                  placeholder="Để trống tự sinh mã KH..."
                  className="w-full rounded-md border border-brand-line bg-brand-surface px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-name"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tên khách hàng <span className="text-[#9f1239]">*</span>
                </label>
                <input
                  id="acc-name"
                  type="text"
                  required
                  value={form.customerName || ''}
                  onChange={(e) => setField('customerName', e.target.value)}
                  placeholder="Tên doanh nghiệp hoặc họ tên khách hàng"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-phone"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Điện thoại <span className="text-[#9f1239]">*</span>
                </label>
                <input
                  id="acc-phone"
                  type="tel"
                  required
                  value={form.phone || ''}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-taxCode"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Mã số thuế
                </label>
                <input
                  id="acc-taxCode"
                  type="text"
                  value={form.taxCode || ''}
                  onChange={(e) => setField('taxCode', e.target.value)}
                  placeholder="010xxxxxxx"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-status"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Trạng thái khách hàng <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="acc-status"
                  value={form.customerStatus || ACCOUNT_CUSTOMER_STATUSES[1]}
                  onChange={(e) => setField('customerStatus', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {ACCOUNT_CUSTOMER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="acc-source"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Nguồn gốc KH <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="acc-source"
                  value={form.leadSource || ''}
                  onChange={(e) => setField('leadSource', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {CRM_LEAD_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {form.customerStatus === 'Không còn tiềm năng' && (
                <div className="sm:col-span-2">
                  <label
                    htmlFor="acc-lostReason"
                    className="mb-1 block text-xs font-semibold text-brand-ink"
                  >
                    Lý do không còn tiềm năng
                  </label>
                  <input
                    id="acc-lostReason"
                    type="text"
                    value={form.lostReason || ''}
                    onChange={(e) => setField('lostReason', e.target.value)}
                    placeholder="Nhập lý do tạm dừng / không còn tiềm năng..."
                    className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="acc-assigned"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Người phụ trách <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="acc-assigned"
                  value={form.assignedUserId || ''}
                  onChange={(e) => setField('assignedUserId', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn người phụ trách --</option>
                  {staffList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="acc-email"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Email
                </label>
                <input
                  id="acc-email"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="contact@doanhnghiep.vn"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-rank"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Hạng khách hàng
                </label>
                <select
                  id="acc-rank"
                  value={form.rankLabel || 'Tiêu chuẩn'}
                  onChange={(e) => setField('rankLabel', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {ACCOUNT_RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="acc-servicesSummary"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Dịch vụ trọng tâm
                </label>
                <input
                  id="acc-servicesSummary"
                  type="text"
                  value={form.servicesSummary || ''}
                  onChange={(e) => setField('servicesSummary', e.target.value)}
                  placeholder="Ví dụ: Bảo hộ nhãn hiệu, Tư vấn thường xuyên"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
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

              <div className="sm:col-span-2">
                <CrmMultiSelectChips
                  label="Tình trạng chăm sóc KH"
                  options={ACCOUNT_CARE_STATUSES}
                  selected={form.careStatuses ?? []}
                  onChange={(careStatuses) => setField('careStatuses', careStatuses)}
                />
              </div>

              <div className="sm:col-span-2">
                <CrmMultiSelectChips
                  label="Lĩnh vực / Ngành nghề"
                  options={ACCOUNT_INDUSTRIES}
                  selected={form.industries ?? []}
                  onChange={(industries) => setField('industries', industries)}
                />
              </div>
            </div>
          </section>

          {/* 2. Thông tin Liên hệ KH */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin Liên hệ KH
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="acc-contactName"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tên liên hệ
                </label>
                <input
                  id="acc-contactName"
                  type="text"
                  value={form.contactName || ''}
                  onChange={(e) => setField('contactName', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-contactTitle"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Chức vụ liên hệ
                </label>
                <input
                  id="acc-contactTitle"
                  type="text"
                  value={form.contactTitle || ''}
                  onChange={(e) => setField('contactTitle', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-contactPhone"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Điện thoại liên hệ
                </label>
                <input
                  id="acc-contactPhone"
                  type="tel"
                  value={form.contactPhone || ''}
                  onChange={(e) => setField('contactPhone', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-contactEmail"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Email liên hệ
                </label>
                <input
                  id="acc-contactEmail"
                  type="email"
                  value={form.contactEmail || ''}
                  onChange={(e) => setField('contactEmail', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-contactBirth"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Sinh nhật khách hàng
                </label>
                <input
                  id="acc-contactBirth"
                  type="date"
                  value={form.contactBirthDate || ''}
                  onChange={(e) => setField('contactBirthDate', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
            </div>
          </section>

          {/* 3. Tóm tắt nội dung tư vấn */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-3 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Tóm tắt nội dung tư vấn
            </h2>
            <div>
              <label
                htmlFor="acc-demand"
                className="mb-1 block text-xs font-semibold text-brand-ink"
              >
                Chi tiết nhu cầu KH <span className="text-[#9f1239]">*</span>
              </label>
              <textarea
                id="acc-demand"
                rows={3}
                required
                value={form.demandDetail || ''}
                onChange={(e) => setField('demandDetail', e.target.value)}
                placeholder="Ghi nhận tóm tắt nhu cầu tư vấn pháp lý, lịch sử hồ sơ hoặc điểm lưu ý..."
                className="w-full rounded-md border border-brand-line bg-white p-3 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              />
            </div>
          </section>

          {/* 4. Thông tin giao hàng / Hóa đơn */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin giao hàng & Hóa đơn
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="acc-billingProvince"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tỉnh/Thành phố (Hóa đơn)
                </label>
                <select
                  id="acc-billingProvince"
                  value={form.billingProvince || ''}
                  onChange={(e) => setField('billingProvince', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn Tỉnh/TP --</option>
                  {CRM_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="acc-billingDistrict"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Quận/Huyện (Hóa đơn)
                </label>
                <input
                  id="acc-billingDistrict"
                  type="text"
                  value={form.billingDistrict || ''}
                  onChange={(e) => setField('billingDistrict', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="acc-billingAddress"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Địa chỉ (Hóa đơn)
                </label>
                <input
                  id="acc-billingAddress"
                  type="text"
                  value={form.billingAddress || ''}
                  onChange={(e) => setField('billingAddress', e.target.value)}
                  placeholder="Địa chỉ đăng ký kinh doanh / xuất hóa đơn GTGT..."
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
            </div>
          </section>

          {/* 5. Thông tin bổ sung */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin bổ sung
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="acc-companySize"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Quy mô nhân sự
                </label>
                <select
                  id="acc-companySize"
                  value={form.companySize || ''}
                  onChange={(e) => setField('companySize', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn quy mô --</option>
                  {CRM_COMPANY_SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="acc-foundedDate"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Ngày thành lập
                </label>
                <input
                  id="acc-foundedDate"
                  type="date"
                  value={form.foundedDate || ''}
                  onChange={(e) => setField('foundedDate', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="acc-paymentTerm"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Loại điều khoản TT
                </label>
                <select
                  id="acc-paymentTerm"
                  value={form.paymentTermType || ''}
                  onChange={(e) => setField('paymentTermType', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn điều khoản TT --</option>
                  {CRM_PAYMENT_TERM_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="acc-website"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Website
                </label>
                <input
                  id="acc-website"
                  type="text"
                  value={form.website || ''}
                  onChange={(e) => setField('website', e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
            </div>
          </section>

          {/* 6. Thông tin hệ thống */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin hệ thống
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="acc-referrer"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Đối tác / CTV giới thiệu
                </label>
                <input
                  id="acc-referrer"
                  type="text"
                  value={form.referrer || ''}
                  onChange={(e) => setField('referrer', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-4">
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

                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-brand-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(form.individual)}
                    onChange={(e) => setField('individual', e.target.checked)}
                    aria-label="Là KH cá nhân"
                    className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Là KH cá nhân</span>
                </label>

                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-brand-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(form.partner)}
                    onChange={(e) => setField('partner', e.target.checked)}
                    aria-label="Là đối tác cộng tác viên"
                    className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Là đối tác/cộng tác viên</span>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
