import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  FilePlus2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Target,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../component/common/ui/Spinner';
import useConfirm from '../../component/common/ui/useConfirm';
import crmEnterpriseApi from '../../features/crm/api';
import CrmQuickActivityPanel from '../../features/crm/CrmQuickActivityPanel';
import CrmStatusBadge, { CrmAssigneePill, CrmTagList } from '../../features/crm/CrmStatusBadge';
import { formatDateTimeVi, formatDateVi, formatVnd } from '../../features/crm/formatters';
import type { CrmAccountOverviewDto } from '../../features/crm/types';
import { CRM_BASE } from './CrmWorkspaceLayout';

type AccountTab = 'overview' | 'detail' | 'contacts' | 'sales' | 'activities';
type SalesSubTab = 'contracts' | 'opportunities';

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, confirmDialog } = useConfirm();

  const [overview, setOverview] = useState<CrmAccountOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const [salesSubTab, setSalesSubTab] = useState<SalesSubTab>('contracts');
  const [fieldQuery, setFieldQuery] = useState('');
  const [showEmptyFields, setShowEmptyFields] = useState(true);

  const [addingContact, setAddingContact] = useState(false);
  const [contactFullName, setContactFullName] = useState('');
  const [contactJobTitle, setContactJobTitle] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  const loadOverview = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await crmEnterpriseApi.getAccountOverview(id);
      setOverview(data);
    } catch {
      try {
        const fallbackAccount = await crmEnterpriseApi.getAccount(id);
        setOverview({
          account: fallbackAccount,
          kpis: {
            contractCount: 0,
            totalOrderValue: 0,
            totalCollected: 0,
            totalReceivable: 0,
            opportunityCount: 0,
            purchaseCycleDays: 0,
          },
          contacts: [],
          opportunities: [],
          contracts: [],
        });
      } catch {
        toast.error('Không tìm thấy Khách hàng');
        navigate(`${CRM_BASE}/account`);
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const account = overview?.account;

  const handleDeleteAccount = async () => {
    if (!account) return;
    const ok = await confirm({
      title: 'Xóa Khách hàng',
      message: `Xóa khách hàng "${account.customerName}" (${account.code})?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await crmEnterpriseApi.deleteAccount(account.id);
      toast.success('Đã xóa Khách hàng');
      navigate(`${CRM_BASE}/account`);
    } catch {
      toast.error('Không thể xóa Khách hàng');
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !contactFullName.trim()) return;
    setSavingContact(true);
    try {
      await crmEnterpriseApi.addAccountContact(account.id, {
        fullName: contactFullName.trim(),
        jobTitle: contactJobTitle.trim() || undefined,
        phone: contactPhone.trim() || undefined,
        email: contactEmail.trim() || undefined,
      });
      toast.success('Đã thêm người liên hệ');
      setAddingContact(false);
      setContactFullName('');
      setContactJobTitle('');
      setContactPhone('');
      setContactEmail('');
      await loadOverview();
    } catch {
      toast.error('Không thể thêm người liên hệ');
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!account) return;
    try {
      await crmEnterpriseApi.deleteAccountContact(account.id, contactId);
      toast.success('Đã xóa người liên hệ');
      await loadOverview();
    } catch {
      toast.error('Không thể xóa người liên hệ');
    }
  };

  const detailSections = useMemo(() => {
    if (!account) return [];
    const q = fieldQuery.trim().toLowerCase();
    const filterItems = (items: { label: string; value: React.ReactNode; rawText?: string }[]) =>
      items.filter((it) => {
        if (!showEmptyFields && (!it.rawText || it.rawText === '—')) return false;
        if (!q) return true;
        return it.label.toLowerCase().includes(q) || (it.rawText ?? '').toLowerCase().includes(q);
      });

    return [
      {
        title: 'Thông tin chung',
        items: filterItems([
          { label: 'Mã khách hàng', value: account.code, rawText: account.code },
          { label: 'Tên khách hàng', value: account.customerName, rawText: account.customerName },
          { label: 'Điện thoại', value: account.phone || '—', rawText: account.phone },
          { label: 'Mã số thuế', value: account.taxCode || '—', rawText: account.taxCode || '' },
          { label: 'Email', value: account.email || '—', rawText: account.email || '' },
          {
            label: 'Trạng thái khách hàng',
            value: <CrmStatusBadge status={account.customerStatus} />,
            rawText: account.customerStatus,
          },
          {
            label: 'Lý do không còn tiềm năng',
            value: account.lostReason || '—',
            rawText: account.lostReason || '',
          },
          {
            label: 'Tình trạng chăm sóc KH',
            value: account.careStatuses?.join(', ') || '—',
            rawText: account.careStatuses?.join(', ') || '',
          },
          {
            label: 'Nguồn gốc KH',
            value: account.leadSource || '—',
            rawText: account.leadSource || '',
          },
          {
            label: 'Người phụ trách',
            value: <CrmAssigneePill name={account.assignedUserName} />,
            rawText: account.assignedUserName || '',
          },
          {
            label: 'Nhóm dịch vụ',
            value: account.serviceGroups?.join(', ') || '—',
            rawText: account.serviceGroups?.join(', ') || '',
          },
          {
            label: 'Lĩnh vực/ngành nghề',
            value: account.industries?.join(', ') || '—',
            rawText: account.industries?.join(', ') || '',
          },
        ]),
      },
      {
        title: 'Thông tin Liên hệ KH',
        items: filterItems([
          {
            label: 'Tên liên hệ',
            value: account.contactName || '—',
            rawText: account.contactName || '',
          },
          {
            label: 'Chức vụ liên hệ',
            value: account.contactTitle || '—',
            rawText: account.contactTitle || '',
          },
          {
            label: 'Điện thoại liên hệ',
            value: account.contactPhone || '—',
            rawText: account.contactPhone || '',
          },
          {
            label: 'Email liên hệ',
            value: account.contactEmail || '—',
            rawText: account.contactEmail || '',
          },
          {
            label: 'Sinh nhật khách hàng',
            value: formatDateVi(account.contactBirthDate),
            rawText: account.contactBirthDate || '',
          },
        ]),
      },
      {
        title: 'Tóm tắt nội dung tư vấn',
        items: filterItems([
          {
            label: 'Chi tiết nhu cầu KH',
            value: <span className="whitespace-pre-line">{account.demandDetail || '—'}</span>,
            rawText: account.demandDetail || '',
          },
        ]),
      },
      {
        title: 'Thông tin hóa đơn & giao nhận',
        items: filterItems([
          {
            label: 'Tỉnh/Thành phố (Hóa đơn)',
            value: account.billingProvince || '—',
            rawText: account.billingProvince || '',
          },
          {
            label: 'Quận/Huyện (Hóa đơn)',
            value: account.billingDistrict || '—',
            rawText: account.billingDistrict || '',
          },
          {
            label: 'Địa chỉ (Hóa đơn)',
            value: account.billingAddress || '—',
            rawText: account.billingAddress || '',
          },
        ]),
      },
      {
        title: 'Thông tin bổ sung & hệ thống',
        items: filterItems([
          {
            label: 'Quy mô nhân sự',
            value: account.companySize || '—',
            rawText: account.companySize || '',
          },
          {
            label: 'Ngày thành lập',
            value: formatDateVi(account.foundedDate),
            rawText: account.foundedDate || '',
          },
          {
            label: 'Loại điều khoản TT',
            value: account.paymentTermType || '—',
            rawText: account.paymentTermType || '',
          },
          { label: 'Website', value: account.website || '—', rawText: account.website || '' },
          {
            label: 'Doanh thu năm',
            value: account.annualRevenue ? formatVnd(account.annualRevenue, true) : '—',
            rawText: account.annualRevenue ? String(account.annualRevenue) : '',
          },
          {
            label: 'Loại đối tượng',
            value: account.individual ? 'Khách hàng cá nhân' : 'Tổ chức / Doanh nghiệp',
            rawText: account.individual ? 'Cá nhân' : 'Tổ chức',
          },
          {
            label: 'Đối tác/CTV giới thiệu',
            value: account.referrer || '—',
            rawText: account.referrer || '',
          },
          {
            label: 'Ngày tạo',
            value: formatDateTimeVi(account.createdAt),
            rawText: account.createdAt || '',
          },
        ]),
      },
    ].filter((s) => s.items.length > 0);
  }, [account, fieldQuery, showEmptyFields]);

  if (loading || !overview || !account) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Đang tải hồ sơ Khách hàng 360°" />
      </div>
    );
  }

  const { kpis, contacts, opportunities, contracts } = overview;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {confirmDialog}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`${CRM_BASE}/account`}
            aria-label="Quay lại danh sách Khách hàng"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-brand-ink sm:text-lg">
                {account.customerName}
              </h1>
              <span className="rounded bg-brand-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-brand-muted">
                {account.code}
              </span>
              <CrmStatusBadge status={account.customerStatus} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`${CRM_BASE}/opportunity/new?accountId=${account.id}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Target size={14} className="text-brand-primary" aria-hidden="true" />
            <span>Tạo Cơ hội HĐ</span>
          </Link>

          <Link
            to={`${CRM_BASE}/account/${account.id}/edit`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Pencil size={13} aria-hidden="true" />
            <span>Sửa</span>
          </Link>

          <Link
            to={`${CRM_BASE}/sale-order/new?accountId=${account.id}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <FilePlus2 size={14} aria-hidden="true" />
            <span>Sinh hợp đồng</span>
          </Link>

          <button
            type="button"
            onClick={handleDeleteAccount}
            aria-label="Xóa Khách hàng"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-[#9f1239] hover:bg-[#ffe4e6]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 360 Workspace Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4 lg:flex-row">
        {/* Left Profile Summary Card */}
        <aside className="w-full shrink-0 space-y-3 rounded-lg border border-brand-line bg-white p-4 lg:w-[290px]">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-surface text-brand-primary">
              <Building2 size={22} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-brand-ink">{account.customerName}</h2>
              <span className="mt-0.5 inline-block rounded bg-brand-accentSoft px-2 py-0.5 text-[11px] font-semibold text-brand-ink">
                Hạng: {account.rankLabel || 'Tiêu chuẩn'}
              </span>
            </div>
          </div>

          <CrmTagList tags={account.tags} />

          <dl className="space-y-2 border-t border-brand-line pt-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-muted">Mã số thuế</dt>
              <dd className="font-semibold tabular-nums text-brand-ink">
                {account.taxCode || '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-muted">Điện thoại</dt>
              <dd className="font-semibold tabular-nums text-brand-ink">
                {account.phone ? (
                  <a
                    href={`tel:${account.phone}`}
                    className="inline-flex items-center gap-1 text-brand-primary hover:underline"
                  >
                    <Phone size={12} aria-hidden="true" />
                    <span>{account.phone}</span>
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-muted">Email</dt>
              <dd className="truncate font-medium text-brand-ink">
                {account.email ? (
                  <a
                    href={`mailto:${account.email}`}
                    className="inline-flex items-center gap-1 text-brand-primary hover:underline"
                  >
                    <Mail size={12} aria-hidden="true" />
                    <span className="max-w-[150px] truncate">{account.email}</span>
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-muted">Ngành nghề</dt>
              <dd className="max-w-[150px] truncate font-medium text-brand-ink">
                {account.industries?.join(', ') || '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-muted">Phụ trách</dt>
              <dd>
                <CrmAssigneePill name={account.assignedUserName} />
              </dd>
            </div>
          </dl>
        </aside>

        {/* Center 360 Tabs */}
        <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-brand-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line px-4">
            <div role="tablist" aria-label="Hồ sơ 360 Khách hàng" className="flex flex-wrap gap-5">
              {(
                [
                  { id: 'overview', label: 'Tổng quan' },
                  { id: 'detail', label: 'Thông tin chi tiết' },
                  { id: 'contacts', label: `Liên hệ (${contacts.length})` },
                  {
                    id: 'sales',
                    label: `Bán hàng (${contracts.length + opportunities.length})`,
                  },
                  { id: 'activities', label: 'Hoạt động' },
                ] as { id: AccountTab; label: string }[]
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
                    aria-label="Tìm kiếm trường thông tin khách hàng"
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

          <div className="flex-1 space-y-5 p-4 sm:p-5">
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Summary Strip (tabular-nums) */}
                <div className="grid grid-cols-2 divide-y divide-brand-line rounded-lg border border-brand-line bg-brand-surface/50 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                  <div className="p-3.5">
                    <div className="text-xs text-brand-muted">Số lượng đơn hàng</div>
                    <div className="mt-1 text-lg font-bold tabular-nums text-brand-ink">
                      {kpis.contractCount}
                    </div>
                  </div>
                  <div className="p-3.5">
                    <div className="text-xs text-brand-muted">Giá trị đơn hàng</div>
                    <div className="mt-1 text-lg font-bold tabular-nums text-brand-primary">
                      {formatVnd(kpis.totalOrderValue, true)}
                    </div>
                  </div>
                  <div className="p-3.5">
                    <div className="text-xs text-brand-muted">Công nợ còn phải thu</div>
                    <div className="mt-1 text-lg font-bold tabular-nums text-[#9f1239]">
                      {formatVnd(kpis.totalReceivable, true)}
                    </div>
                  </div>
                  <div className="p-3.5">
                    <div className="text-xs text-brand-muted">Chu kỳ mua hàng</div>
                    <div className="mt-1 text-lg font-bold tabular-nums text-brand-ink">
                      {kpis.purchaseCycleDays || 0} ngày
                    </div>
                  </div>
                </div>

                <CrmQuickActivityPanel
                  entityType="ACCOUNT"
                  entityId={account.id}
                  entityLabel={account.customerName}
                  entityPhone={account.phone}
                />
              </div>
            )}

            {activeTab === 'detail' &&
              detailSections.map((section) => (
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

            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-brand-ink">
                    Danh bạ người liên hệ của khách hàng
                  </h2>
                  <button
                    type="button"
                    onClick={() => setAddingContact((v) => !v)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <UserPlus size={14} aria-hidden="true" />
                    <span>Thêm liên hệ</span>
                  </button>
                </div>

                {addingContact && (
                  <form
                    onSubmit={handleAddContact}
                    className="grid grid-cols-1 gap-3 rounded-lg border border-brand-line bg-brand-surface/50 p-3.5 sm:grid-cols-4"
                  >
                    <input
                      type="text"
                      required
                      aria-label="Họ và tên người liên hệ"
                      placeholder="Họ và tên *"
                      value={contactFullName}
                      onChange={(e) => setContactFullName(e.target.value)}
                      className="rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    />
                    <input
                      type="text"
                      aria-label="Chức vụ người liên hệ"
                      placeholder="Chức vụ"
                      value={contactJobTitle}
                      onChange={(e) => setContactJobTitle(e.target.value)}
                      className="rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    />
                    <input
                      type="tel"
                      aria-label="Điện thoại người liên hệ"
                      placeholder="Số điện thoại"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        aria-label="Email người liên hệ"
                        placeholder="Email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                      <button
                        type="submit"
                        disabled={savingContact}
                        className="shrink-0 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-60"
                      >
                        Lưu
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto rounded-lg border border-brand-line">
                  <table className="min-w-full border-collapse text-left text-xs">
                    <thead className="border-b border-brand-line bg-brand-surface text-brand-ink">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Họ và tên</th>
                        <th className="px-3 py-2.5 font-semibold">Chức vụ</th>
                        <th className="px-3 py-2.5 font-semibold">Điện thoại</th>
                        <th className="px-3 py-2.5 font-semibold">Email</th>
                        <th className="w-16 px-3 py-2.5 text-center font-semibold">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-line">
                      {contacts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-brand-muted">
                            Chưa có người liên hệ phụ nào.
                          </td>
                        </tr>
                      ) : (
                        contacts.map((c) => (
                          <tr key={c.id}>
                            <td className="px-3 py-2 font-semibold text-brand-ink">{c.fullName}</td>
                            <td className="px-3 py-2 text-brand-muted">{c.jobTitle || '—'}</td>
                            <td className="px-3 py-2 tabular-nums text-brand-ink">
                              {c.phone || '—'}
                            </td>
                            <td className="px-3 py-2 text-brand-ink">{c.email || '—'}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteContact(c.id)}
                                aria-label={`Xóa liên hệ ${c.fullName}`}
                                className="rounded p-1 text-brand-muted hover:bg-[#ffe4e6] hover:text-[#9f1239]"
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSalesSubTab('contracts')}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                        salesSubTab === 'contracts'
                          ? 'bg-brand-primary text-white'
                          : 'bg-brand-surface text-brand-ink hover:bg-brand-line/50'
                      }`}
                    >
                      Hợp đồng ({contracts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSalesSubTab('opportunities')}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                        salesSubTab === 'opportunities'
                          ? 'bg-brand-primary text-white'
                          : 'bg-brand-surface text-brand-ink hover:bg-brand-line/50'
                      }`}
                    >
                      Cơ hội HĐ ({opportunities.length})
                    </button>
                  </div>

                  {salesSubTab === 'contracts' ? (
                    <Link
                      to={`${CRM_BASE}/sale-order/new?accountId=${account.id}`}
                      className="inline-flex h-8 items-center gap-1 rounded-md bg-brand-primary px-3 text-xs font-semibold text-white hover:bg-brand-primaryDark"
                    >
                      <Plus size={14} aria-hidden="true" />
                      <span>Thêm Hợp đồng</span>
                    </Link>
                  ) : (
                    <Link
                      to={`${CRM_BASE}/opportunity/new?accountId=${account.id}`}
                      className="inline-flex h-8 items-center gap-1 rounded-md bg-brand-primary px-3 text-xs font-semibold text-white hover:bg-brand-primaryDark"
                    >
                      <Plus size={14} aria-hidden="true" />
                      <span>Thêm Cơ hội HĐ</span>
                    </Link>
                  )}
                </div>

                {salesSubTab === 'contracts' ? (
                  <div className="overflow-x-auto rounded-lg border border-brand-line">
                    <table className="min-w-full border-collapse text-left text-xs">
                      <thead className="border-b border-brand-line bg-brand-surface text-brand-ink">
                        <tr>
                          <th className="px-3 py-2.5 font-semibold">Số Hợp đồng</th>
                          <th className="px-3 py-2.5 font-semibold">Ngày ghi sổ</th>
                          <th className="px-3 py-2.5 font-semibold">Tình trạng thực hiện</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Giá trị đơn hàng</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Thực thu</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Còn phải thu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-line">
                        {contracts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-brand-muted">
                              Khách hàng chưa có hợp đồng nào.
                            </td>
                          </tr>
                        ) : (
                          contracts.map((c) => (
                            <tr key={c.id} className="hover:bg-brand-surface/40">
                              <td className="px-3 py-2">
                                <Link
                                  to={`${CRM_BASE}/sale-order/${c.id}`}
                                  className="font-semibold tabular-nums text-brand-primary hover:underline"
                                >
                                  {c.contractNumber}
                                </Link>
                              </td>
                              <td className="px-3 py-2 tabular-nums text-brand-muted">
                                {formatDateVi(c.bookingDate)}
                              </td>
                              <td className="px-3 py-2">
                                <CrmStatusBadge status={c.executionStatus} />
                              </td>
                              <td className="px-3 py-2 text-right font-semibold tabular-nums text-brand-ink">
                                {formatVnd(c.orderValue)}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums text-[#065f46]">
                                {formatVnd(c.collectedAmount)}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums text-[#9f1239]">
                                {formatVnd(c.receivableAmount)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-brand-line">
                    <table className="min-w-full border-collapse text-left text-xs">
                      <thead className="border-b border-brand-line bg-brand-surface text-brand-ink">
                        <tr>
                          <th className="px-3 py-2.5 font-semibold">Mã / Tên cơ hội</th>
                          <th className="px-3 py-2.5 font-semibold">Giai đoạn</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Doanh số kỳ vọng</th>
                          <th className="px-3 py-2.5 font-semibold">Ngày kỳ vọng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-line">
                        {opportunities.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-brand-muted">
                              Khách hàng chưa có cơ hội hợp đồng nào.
                            </td>
                          </tr>
                        ) : (
                          opportunities.map((o) => (
                            <tr key={o.id} className="hover:bg-brand-surface/40">
                              <td className="px-3 py-2">
                                <Link
                                  to={`${CRM_BASE}/opportunity/${o.id}`}
                                  className="font-semibold text-brand-primary hover:underline"
                                >
                                  {o.opportunityName}
                                </Link>
                                <div className="text-[11px] tabular-nums text-brand-muted">
                                  {o.code}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <CrmStatusBadge status={o.stage} />
                              </td>
                              <td className="px-3 py-2 text-right font-semibold tabular-nums text-brand-ink">
                                {formatVnd(o.expectedRevenue)}
                              </td>
                              <td className="px-3 py-2 tabular-nums text-brand-muted">
                                {formatDateVi(o.expectedCloseDate)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <CrmQuickActivityPanel
                entityType="ACCOUNT"
                entityId={account.id}
                entityLabel={account.customerName}
                entityPhone={account.phone}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
