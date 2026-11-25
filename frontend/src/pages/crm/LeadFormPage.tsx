import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../component/common/ui/Spinner';
import crmEnterpriseApi from '../../features/crm/api';
import CrmMultiSelectChips from '../../features/crm/CrmMultiSelectChips';
import {
  CRM_COMPANY_SIZES,
  CRM_DEPARTMENTS,
  CRM_GENDERS,
  CRM_LEAD_SOURCES,
  CRM_PROVINCES,
  CRM_SERVICE_GROUPS,
  LEAD_CUSTOMER_STATUSES,
} from '../../features/crm/constants';
import { toDateInputValue } from '../../features/crm/formatters';
import type { CrmLeadWritePayload } from '../../features/crm/types';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

const INITIAL_LEAD: CrmLeadWritePayload = {
  code: '',
  customerName: '',
  fullName: '',
  phone: '',
  taxCode: '',
  personalEmail: '',
  workEmail: '',
  serviceGroups: ['Sở hữu trí tuệ'],
  tags: [],
  jobTitle: '',
  assignedUserId: '',
  ownerUserId: '',
  leadSource: CRM_LEAD_SOURCES[0],
  customerStatus: LEAD_CUSTOMER_STATUSES[2],
  demandDetail: '',
  organizationName: '',
  gender: 'Nữ',
  zalo: '',
  website: '',
  birthDate: '',
  companySize: '',
  country: 'Việt Nam',
  province: 'Hà Nội',
  district: '',
  address: '',
  shared: false,
  department: CRM_DEPARTMENTS[0],
};

export default function LeadFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { me, staffList } = useCrmWorkspace();

  const [form, setForm] = useState<CrmLeadWritePayload>(INITIAL_LEAD);
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
      .getLead(id)
      .then((data) => {
        if (!active) return;
        setForm({
          ...data,
          birthDate: toDateInputValue(data.birthDate),
          gender: data.gender || 'Nữ',
          country: data.country || 'Việt Nam',
        });
      })
      .catch(() => {
        toast.error('Không tải được thông tin KH Liên hệ');
        navigate(`${CRM_BASE}/lead`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const setField = <K extends keyof CrmLeadWritePayload>(key: K, value: CrmLeadWritePayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitForm = async (saveAndNew = false) => {
    const fullName = (form.fullName || form.customerName || '').trim();
    const customerName = (form.customerName || fullName).trim();
    if (!fullName || !form.phone?.trim()) {
      toast.error('Vui lòng nhập đầy đủ Họ và tên và Điện thoại');
      return;
    }

    const assignedStaff = staffList.find((u) => u.id === form.assignedUserId);
    const ownerStaff = staffList.find((u) => u.id === form.ownerUserId);

    const payload: CrmLeadWritePayload = {
      ...form,
      fullName,
      customerName,
      phone: form.phone.trim(),
      assignedUserName: assignedStaff?.fullName || form.assignedUserName,
      ownerUserName: ownerStaff?.fullName || form.ownerUserName,
      birthDate: form.birthDate || null,
    };

    setSaving(true);
    try {
      if (isEdit && id) {
        const saved = await crmEnterpriseApi.updateLead(id, payload);
        toast.success('Đã cập nhật KH Liên hệ');
        navigate(`${CRM_BASE}/lead/${saved.id}`);
      } else {
        const saved = await crmEnterpriseApi.createLead(payload);
        toast.success('Đã thêm mới KH Liên hệ');
        if (saveAndNew) {
          setForm({
            ...INITIAL_LEAD,
            assignedUserId: me?.id || '',
            ownerUserId: me?.id || '',
          });
        } else {
          navigate(`${CRM_BASE}/lead/${saved.id}`);
        }
      }
    } catch {
      toast.error('Lưu KH Liên hệ thất bại. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Đang tải biểu mẫu KH Liên hệ" />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitForm(false);
      }}
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Link
            to={isEdit && id ? `${CRM_BASE}/lead/${id}` : `${CRM_BASE}/lead`}
            aria-label="Quay lại"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>
          <h1 className="text-base font-bold text-brand-ink sm:text-lg">
            {isEdit ? `Sửa KH Liên hệ (${form.code || ''})` : 'Thêm mới KH Liên hệ'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={isEdit && id ? `${CRM_BASE}/lead/${id}` : `${CRM_BASE}/lead`}
            className="inline-flex h-8 items-center rounded-md border border-brand-line bg-white px-3.5 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            Hủy
          </Link>
          {!isEdit && (
            <button
              type="button"
              disabled={saving}
              onClick={() => submitForm(true)}
              className="inline-flex h-8 items-center rounded-md border border-brand-primary bg-white px-3.5 text-xs font-semibold text-brand-primary hover:bg-brand-surface disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Lưu và thêm mới
            </button>
          )}
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

      {/* Form Body: 5 MISA Sections */}
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
                  htmlFor="lead-fullName"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Họ và tên <span className="text-[#9f1239]">*</span>
                </label>
                <input
                  id="lead-fullName"
                  type="text"
                  required
                  value={form.fullName || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      fullName: val,
                      customerName:
                        !prev.customerName || prev.customerName === prev.fullName
                          ? val
                          : prev.customerName,
                    }));
                  }}
                  placeholder="Nhập họ và tên người liên hệ..."
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-customerName"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tên khách hàng
                </label>
                <input
                  id="lead-customerName"
                  type="text"
                  value={form.customerName || ''}
                  onChange={(e) => setField('customerName', e.target.value)}
                  placeholder="Tự động đồng bộ hoặc nhập tên thương hiệu/khách hàng"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-phone"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Điện thoại <span className="text-[#9f1239]">*</span>
                </label>
                <input
                  id="lead-phone"
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
                  htmlFor="lead-taxCode"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Mã số thuế
                </label>
                <input
                  id="lead-taxCode"
                  type="text"
                  value={form.taxCode || ''}
                  onChange={(e) => setField('taxCode', e.target.value)}
                  placeholder="010xxxxxxx"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-personalEmail"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Email cá nhân
                </label>
                <input
                  id="lead-personalEmail"
                  type="email"
                  value={form.personalEmail || ''}
                  onChange={(e) => setField('personalEmail', e.target.value)}
                  placeholder="khachhang@email.com"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-jobTitle"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Chức danh
                </label>
                <input
                  id="lead-jobTitle"
                  type="text"
                  value={form.jobTitle || ''}
                  onChange={(e) => setField('jobTitle', e.target.value)}
                  placeholder="Giám đốc, Trưởng phòng pháp chế..."
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-status"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Trạng thái khách hàng
                </label>
                <select
                  id="lead-status"
                  value={form.customerStatus || LEAD_CUSTOMER_STATUSES[2]}
                  onChange={(e) => setField('customerStatus', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {LEAD_CUSTOMER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="lead-source"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Nguồn gốc KH
                </label>
                <select
                  id="lead-source"
                  value={form.leadSource || ''}
                  onChange={(e) => setField('leadSource', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn nguồn gốc --</option>
                  {CRM_LEAD_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="lead-assigned"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Người phụ trách
                </label>
                <select
                  id="lead-assigned"
                  value={form.assignedUserId || ''}
                  onChange={(e) => setField('assignedUserId', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chưa phân công --</option>
                  {staffList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <CrmMultiSelectChips
                  label="Thẻ phân loại (Tags)"
                  options={['VIP', 'Gấp', 'Nhãn hiệu', 'Giấy phép con']}
                  selected={form.tags ?? []}
                  onChange={(tags) => setField('tags', tags)}
                  allowCustom
                  customPlaceholder="Nhập thẻ mới..."
                />
              </div>

              <div className="sm:col-span-2">
                <CrmMultiSelectChips
                  label="Nhóm dịch vụ"
                  options={CRM_SERVICE_GROUPS}
                  selected={form.serviceGroups ?? []}
                  onChange={(serviceGroups) => setField('serviceGroups', serviceGroups)}
                />
              </div>
            </div>
          </section>

          {/* 2. Thông tin nhu cầu KH */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-3 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin nhu cầu KH
            </h2>
            <div>
              <label
                htmlFor="lead-demand"
                className="mb-1 block text-xs font-semibold text-brand-ink"
              >
                Chi tiết nhu cầu KH
              </label>
              <textarea
                id="lead-demand"
                rows={3}
                value={form.demandDetail || ''}
                onChange={(e) => setField('demandDetail', e.target.value)}
                placeholder="Ghi rõ yêu cầu tra cứu nhãn hiệu, thành lập doanh nghiệp, giấy phép con, tiến độ mong muốn..."
                className="w-full rounded-md border border-brand-line bg-white p-3 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              />
            </div>
          </section>

          {/* 3. Thông tin tổ chức và đầu mối liên hệ */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin tổ chức và đầu mối liên hệ
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="lead-org"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tổ chức / Doanh nghiệp
                </label>
                <input
                  id="lead-org"
                  type="text"
                  value={form.organizationName || ''}
                  onChange={(e) => setField('organizationName', e.target.value)}
                  placeholder="Tên công ty / hộ kinh doanh"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-gender"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Giới tính <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="lead-gender"
                  value={form.gender || 'Nữ'}
                  onChange={(e) => setField('gender', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {CRM_GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="lead-zalo"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Zalo
                </label>
                <input
                  id="lead-zalo"
                  type="text"
                  value={form.zalo || ''}
                  onChange={(e) => setField('zalo', e.target.value)}
                  placeholder="Số Zalo liên hệ"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-website"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Website
                </label>
                <input
                  id="lead-website"
                  type="text"
                  value={form.website || ''}
                  onChange={(e) => setField('website', e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-birthDate"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Ngày sinh
                </label>
                <input
                  id="lead-birthDate"
                  type="date"
                  value={form.birthDate || ''}
                  onChange={(e) => setField('birthDate', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-companySize"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Quy mô nhân sự
                </label>
                <select
                  id="lead-companySize"
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
            </div>
          </section>

          {/* 4. Thông tin địa chỉ */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin địa chỉ
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="lead-country"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Quốc gia
                </label>
                <input
                  id="lead-country"
                  type="text"
                  value={form.country || 'Việt Nam'}
                  onChange={(e) => setField('country', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-province"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tỉnh/Thành phố
                </label>
                <select
                  id="lead-province"
                  value={form.province || ''}
                  onChange={(e) => setField('province', e.target.value)}
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
                  htmlFor="lead-district"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Quận/Huyện
                </label>
                <input
                  id="lead-district"
                  type="text"
                  value={form.district || ''}
                  onChange={(e) => setField('district', e.target.value)}
                  placeholder="Quận Cầu Giấy, Quận 1..."
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="lead-address"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Địa chỉ chi tiết
                </label>
                <input
                  id="lead-address"
                  type="text"
                  value={form.address || ''}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="Số nhà, ngõ/đường, phường/xã..."
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
            </div>
          </section>

          {/* 5. Thông tin hệ thống */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              Thông tin hệ thống
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="lead-code"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Mã tiềm năng
                </label>
                <input
                  id="lead-code"
                  type="text"
                  value={form.code || ''}
                  onChange={(e) => setField('code', e.target.value)}
                  placeholder="Để trống tự sinh mã TN..."
                  className="w-full rounded-md border border-brand-line bg-brand-surface px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-owner"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Chủ sở hữu
                </label>
                <select
                  id="lead-owner"
                  value={form.ownerUserId || ''}
                  onChange={(e) => setField('ownerUserId', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn chủ sở hữu --</option>
                  {staffList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="lead-dept"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Đơn vị / Phòng ban
                </label>
                <select
                  id="lead-dept"
                  value={form.department || ''}
                  onChange={(e) => setField('department', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn đơn vị --</option>
                  {CRM_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-brand-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(form.shared)}
                    onChange={(e) => setField('shared', e.target.checked)}
                    aria-label="Dùng chung cho toàn công ty"
                    className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>
                    Dùng chung (Cho phép các bộ phận khác tra cứu thông tin KH Liên hệ này)
                  </span>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
