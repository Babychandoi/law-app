import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../component/common/ui/Spinner';
import crmEnterpriseApi from '../../features/crm/api';
import CrmLineItemsEditor from '../../features/crm/CrmLineItemsEditor';
import {
  ARCHIVED_STATUSES,
  CONTRACT_SOURCES,
  CRM_DEPARTMENTS,
  CRM_LEAD_SOURCES,
  CRM_PAYMENT_TERM_TYPES,
  CRM_PROVINCES,
  CRM_UNITS,
  EXECUTION_STATUSES,
  REVENUE_STATUSES,
} from '../../features/crm/constants';
import {
  calculateLineItemsTotal,
  formatVnd,
  toDateInputValue,
} from '../../features/crm/formatters';
import type {
  CrmAccountDto,
  CrmContractWritePayload,
  CrmLineItemDto,
} from '../../features/crm/types';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

const INITIAL_CONTRACT: CrmContractWritePayload = {
  contractNumber: '',
  accountId: '',
  accountName: '',
  contactName: '',
  opportunityId: '',
  parentContractNumber: '',
  goodsSummary: '',
  bookingDate: toDateInputValue(new Date().toISOString()),
  paymentDate: '',
  submissionDate: '',
  handoverDeadline: '',
  orderDate: toDateInputValue(new Date().toISOString()),
  productionDeadline: '',
  revenueStatus: REVENUE_STATUSES[0],
  executionStatus: EXECUTION_STATUSES[0],
  archivedStatus: ARCHIVED_STATUSES[0],
  leadSource: CRM_LEAD_SOURCES[0],
  contractSource: CONTRACT_SOURCES[0],
  paymentTermType: CRM_PAYMENT_TERM_TYPES[0],
  assignedUserId: '',
  department: CRM_DEPARTMENTS[0],
  unitName: CRM_UNITS[0],
  liquidationValue: 0,
  orderValue: 0,
  collectedAmount: 0,
  actualExpense: 0,
  plannedExpense: 0,
  receivableAmount: 0,
  payableAmount: 0,
  estimatedProfit: 0,
  serviceExpense: 0,
  stateFeeExpense: 0,
  supportExpense: 0,
  uninvoicedAmount: 0,
  invoiceLookupCode: '',
  invoiceCustomerName: '',
  buyerName: '',
  invoiceCountry: 'Việt Nam',
  invoiceProvince: 'Hà Nội',
  invoiceDistrict: '',
  invoiceAddress: '',
  taxCode: '',
  shared: false,
  referrer: '',
  syncPriceAfterDiscount: true,
  notes: '',
  items: [],
};

export default function ContractFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const prefillAccountId = searchParams.get('accountId');
  const prefillOpportunityId = searchParams.get('opportunityId');
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { me, staffList } = useCrmWorkspace();

  const [form, setForm] = useState<CrmContractWritePayload>(INITIAL_CONTRACT);
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
          leadSource: acc.leadSource || prev.leadSource,
          paymentTermType: acc.paymentTermType || prev.paymentTermType,
          invoiceCustomerName: acc.customerName,
          buyerName: acc.contactName || acc.customerName,
          taxCode: acc.taxCode || '',
          invoiceProvince: acc.billingProvince || prev.invoiceProvince,
          invoiceDistrict: acc.billingDistrict || '',
          invoiceAddress: acc.billingAddress || '',
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
    if (isEdit || !prefillOpportunityId) return;
    let active = true;
    crmEnterpriseApi
      .getOpportunity(prefillOpportunityId)
      .then((opp) => {
        if (!active) return;
        setForm((prev) => ({
          ...prev,
          opportunityId: opp.id,
          accountId: opp.accountId || prev.accountId,
          accountName: opp.accountName || prev.accountName,
          contactName: opp.contactName || prev.contactName,
          leadSource: opp.leadSource || prev.leadSource,
          contractSource: 'Chuyển đổi từ Cơ hội HĐ',
          orderValue: opp.expectedRevenue || prev.orderValue,
          goodsSummary: opp.opportunityName,
          items: opp.items ?? [],
        }));
      })
      .catch(() => {
        // Ignore prefill error
      });
    return () => {
      active = false;
    };
  }, [isEdit, prefillOpportunityId]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    crmEnterpriseApi
      .getContract(id)
      .then((data) => {
        if (!active) return;
        setForm({
          ...data,
          bookingDate: toDateInputValue(data.bookingDate),
          paymentDate: toDateInputValue(data.paymentDate),
          submissionDate: toDateInputValue(data.submissionDate),
          handoverDeadline: toDateInputValue(data.handoverDeadline),
          orderDate: toDateInputValue(data.orderDate),
          productionDeadline: toDateInputValue(data.productionDeadline),
        });
      })
      .catch(() => {
        toast.error('Không tải được Hợp đồng');
        navigate(`${CRM_BASE}/sale-order`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const setField = <K extends keyof CrmContractWritePayload>(
    key: K,
    value: CrmContractWritePayload[K]
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
      invoiceCustomerName: prev.invoiceCustomerName || found.customerName,
      buyerName: prev.buyerName || found.contactName || found.customerName,
      taxCode: prev.taxCode || found.taxCode || '',
      invoiceProvince: found.billingProvince || prev.invoiceProvince,
      invoiceDistrict: found.billingDistrict || prev.invoiceDistrict,
      invoiceAddress: found.billingAddress || prev.invoiceAddress,
    }));
  };

  const handleItemsChange = (nextItems: CrmLineItemDto[]) => {
    const totals = calculateLineItemsTotal(nextItems);
    const summary = nextItems
      .map((i) => i.description)
      .filter(Boolean)
      .join('; ');
    setForm((prev) => ({
      ...prev,
      items: nextItems,
      orderValue: nextItems.length > 0 ? totals.grandTotal : prev.orderValue,
      goodsSummary: summary || prev.goodsSummary,
    }));
  };

  // Live financial preview
  const orderValue = Number(form.orderValue ?? 0);
  const collectedAmount = Number(form.collectedAmount ?? 0);
  const serviceExpense = Number(form.serviceExpense ?? 0);
  const stateFeeExpense = Number(form.stateFeeExpense ?? 0);
  const supportExpense = Number(form.supportExpense ?? 0);
  const breakdownExpense = serviceExpense + stateFeeExpense + supportExpense;
  const actualExpense = breakdownExpense > 0 ? breakdownExpense : Number(form.actualExpense ?? 0);
  const plannedExpense = Number(form.plannedExpense ?? breakdownExpense);
  const receivableAmount = Math.max(0, orderValue - collectedAmount);
  const payableAmount = Math.max(0, plannedExpense - actualExpense);
  const estimatedProfit = orderValue - Math.max(plannedExpense, actualExpense);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountId && !form.accountName?.trim()) {
      toast.error('Vui lòng chọn hoặc nhập tên Khách hàng');
      return;
    }

    const assignedStaff = staffList.find((u) => u.id === form.assignedUserId);
    const payload: CrmContractWritePayload = {
      ...form,
      assignedUserName: assignedStaff?.fullName || form.assignedUserName,
      orderValue,
      collectedAmount,
      serviceExpense,
      stateFeeExpense,
      supportExpense,
      actualExpense,
      plannedExpense,
      receivableAmount,
      payableAmount,
      estimatedProfit,
      bookingDate: form.bookingDate || null,
      paymentDate: form.paymentDate || null,
      submissionDate: form.submissionDate || null,
      handoverDeadline: form.handoverDeadline || null,
      orderDate: form.orderDate || null,
      productionDeadline: form.productionDeadline || null,
    };

    setSaving(true);
    try {
      const saved =
        isEdit && id
          ? await crmEnterpriseApi.updateContract(id, payload)
          : await crmEnterpriseApi.createContract(payload);
      toast.success(isEdit ? 'Đã cập nhật Hợp đồng' : 'Đã tạo mới Hợp đồng');
      navigate(`${CRM_BASE}/sale-order/${saved.id}`);
    } catch {
      toast.error('Không thể lưu Hợp đồng. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Đang tải biểu mẫu Hợp đồng" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Link
            to={isEdit && id ? `${CRM_BASE}/sale-order/${id}` : `${CRM_BASE}/sale-order`}
            aria-label="Quay lại"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>
          <h1 className="text-base font-bold text-brand-ink sm:text-lg">
            {isEdit ? `Sửa Hợp đồng (${form.contractNumber || ''})` : 'Thêm mới Hợp đồng'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={isEdit && id ? `${CRM_BASE}/sale-order/${id}` : `${CRM_BASE}/sale-order`}
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

      {/* 5 MISA Sections */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-5">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* 1. Thông tin chung */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              1. Thông tin chung
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="ct-number"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Số Hợp đồng
                </label>
                <input
                  id="ct-number"
                  type="text"
                  value={form.contractNumber || ''}
                  onChange={(e) => setField('contractNumber', e.target.value)}
                  placeholder="Để trống tự sinh PD..."
                  className="w-full rounded-md border border-brand-line bg-brand-surface px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="ct-account"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Khách hàng <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="ct-account"
                  value={form.accountId || ''}
                  onChange={(e) => handleAccountSelect(e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn khách hàng từ danh mục --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ct-accountName"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tên khách hàng trên HĐ
                </label>
                <input
                  id="ct-accountName"
                  type="text"
                  value={form.accountName || ''}
                  onChange={(e) => setField('accountName', e.target.value)}
                  placeholder="Nhập trực tiếp nếu chưa chọn KH"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-contact"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Liên hệ
                </label>
                <input
                  id="ct-contact"
                  type="text"
                  value={form.contactName || ''}
                  onChange={(e) => setField('contactName', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-orderVal"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Giá trị đơn hàng (VNĐ) <span className="text-[#9f1239]">*</span>
                </label>
                <input
                  id="ct-orderVal"
                  type="number"
                  min={0}
                  step="any"
                  value={form.orderValue ?? 0}
                  onChange={(e) => setField('orderValue', Number(e.target.value))}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-liqVal"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Giá trị thanh lý
                </label>
                <input
                  id="ct-liqVal"
                  type="number"
                  min={0}
                  step="any"
                  value={form.liquidationValue ?? 0}
                  onChange={(e) => setField('liquidationValue', Number(e.target.value))}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-leadSource"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Nguồn gốc KH <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="ct-leadSource"
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

              <div>
                <label
                  htmlFor="ct-contractSource"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Nguồn gốc Hợp đồng <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="ct-contractSource"
                  value={form.contractSource || ''}
                  onChange={(e) => setField('contractSource', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {CONTRACT_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ct-execStatus"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tình trạng thực hiện HĐ <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="ct-execStatus"
                  value={form.executionStatus || EXECUTION_STATUSES[0]}
                  onChange={(e) => setField('executionStatus', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {EXECUTION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ct-assigned"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Người phụ trách <span className="text-[#9f1239]">*</span>
                </label>
                <select
                  id="ct-assigned"
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
                  htmlFor="ct-archived"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  HĐ Lưu
                </label>
                <select
                  id="ct-archived"
                  value={form.archivedStatus || 'Chưa có'}
                  onChange={(e) => setField('archivedStatus', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {ARCHIVED_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ct-submissionDate"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Ngày nộp hồ sơ
                </label>
                <input
                  id="ct-submissionDate"
                  type="date"
                  value={form.submissionDate || ''}
                  onChange={(e) => setField('submissionDate', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-handover"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Hạn bàn giao KQ
                </label>
                <input
                  id="ct-handover"
                  type="date"
                  value={form.handoverDeadline || ''}
                  onChange={(e) => setField('handoverDeadline', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-paymentTerm"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Loại điều khoản TT
                </label>
                <select
                  id="ct-paymentTerm"
                  value={form.paymentTermType || ''}
                  onChange={(e) => setField('paymentTermType', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {CRM_PAYMENT_TERM_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ct-parent"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Hợp đồng cha / liên quan
                </label>
                <input
                  id="ct-parent"
                  type="text"
                  value={form.parentContractNumber || ''}
                  onChange={(e) => setField('parentContractNumber', e.target.value)}
                  placeholder="Số HĐ gốc (nếu là phụ lục)"
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="ct-goodsSummary"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tóm tắt hàng hóa / dịch vụ
                </label>
                <input
                  id="ct-goodsSummary"
                  type="text"
                  value={form.goodsSummary || ''}
                  onChange={(e) => setField('goodsSummary', e.target.value)}
                  placeholder="Tự động tổng hợp từ bảng dịch vụ bên dưới..."
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
            </div>
          </section>

          {/* 2. Thông tin giá trị hợp đồng */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-3 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              2. Thông tin giá trị hợp đồng (Hàng hóa / Dịch vụ)
            </h2>
            <CrmLineItemsEditor items={form.items ?? []} onChange={handleItemsChange} />
          </section>

          {/* 3. Thông tin thu chi hợp đồng */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              3. Thông tin thu chi hợp đồng
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="ct-bookingDate"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Ngày ghi sổ
                </label>
                <input
                  id="ct-bookingDate"
                  type="date"
                  value={form.bookingDate || ''}
                  onChange={(e) => setField('bookingDate', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-paymentDate"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Ngày thanh toán
                </label>
                <input
                  id="ct-paymentDate"
                  type="date"
                  value={form.paymentDate || ''}
                  onChange={(e) => setField('paymentDate', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-revStatus"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tình trạng ghi doanh số
                </label>
                <select
                  id="ct-revStatus"
                  value={form.revenueStatus || REVENUE_STATUSES[0]}
                  onChange={(e) => setField('revenueStatus', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {REVENUE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ct-collected"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Thực thu (VNĐ)
                </label>
                <input
                  id="ct-collected"
                  type="number"
                  min={0}
                  step="any"
                  value={form.collectedAmount ?? 0}
                  onChange={(e) => setField('collectedAmount', Number(e.target.value))}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-plannedExp"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Dự kiến chi (VNĐ)
                </label>
                <input
                  id="ct-plannedExp"
                  type="number"
                  min={0}
                  step="any"
                  value={form.plannedExpense ?? 0}
                  onChange={(e) => setField('plannedExpense', Number(e.target.value))}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-prodDeadline"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Hạn sản xuất / xử lý nội bộ
                </label>
                <input
                  id="ct-prodDeadline"
                  type="date"
                  value={form.productionDeadline || ''}
                  onChange={(e) => setField('productionDeadline', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-serviceExp"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Chi dịch vụ (VNĐ)
                </label>
                <input
                  id="ct-serviceExp"
                  type="number"
                  min={0}
                  step="any"
                  value={form.serviceExpense ?? 0}
                  onChange={(e) => setField('serviceExpense', Number(e.target.value))}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-stateExp"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Chi nhà nước (VNĐ)
                </label>
                <input
                  id="ct-stateExp"
                  type="number"
                  min={0}
                  step="any"
                  value={form.stateFeeExpense ?? 0}
                  onChange={(e) => setField('stateFeeExpense', Number(e.target.value))}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-supportExp"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Chi hỗ trợ (VNĐ)
                </label>
                <input
                  id="ct-supportExp"
                  type="number"
                  min={0}
                  step="any"
                  value={form.supportExpense ?? 0}
                  onChange={(e) => setField('supportExpense', Number(e.target.value))}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
            </div>

            {/* Auto-calculated Financial Preview */}
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-brand-line bg-brand-surface p-3 text-xs sm:grid-cols-4">
              <div>
                <span className="text-brand-muted">Thực tế chi:</span>
                <div className="mt-0.5 font-bold tabular-nums text-brand-ink">
                  {formatVnd(actualExpense, true)}
                </div>
              </div>
              <div>
                <span className="text-brand-muted">Còn phải thu:</span>
                <div className="mt-0.5 font-bold tabular-nums text-[#9f1239]">
                  {formatVnd(receivableAmount, true)}
                </div>
              </div>
              <div>
                <span className="text-brand-muted">Còn phải chi:</span>
                <div className="mt-0.5 font-bold tabular-nums text-brand-ink">
                  {formatVnd(payableAmount, true)}
                </div>
              </div>
              <div>
                <span className="text-brand-muted">Dự kiến lãi lỗ:</span>
                <div
                  className={`mt-0.5 font-bold tabular-nums ${
                    estimatedProfit >= 0 ? 'text-[#065f46]' : 'text-[#9f1239]'
                  }`}
                >
                  {formatVnd(estimatedProfit, true)}
                </div>
              </div>
            </div>
          </section>

          {/* 4. Thông tin hóa đơn */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              4. Thông tin hóa đơn
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="ct-invCustomer"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Khách hàng (Hóa đơn)
                </label>
                <input
                  id="ct-invCustomer"
                  type="text"
                  value={form.invoiceCustomerName || ''}
                  onChange={(e) => setField('invoiceCustomerName', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-buyer"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Người mua hàng
                </label>
                <input
                  id="ct-buyer"
                  type="text"
                  value={form.buyerName || ''}
                  onChange={(e) => setField('buyerName', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-taxCode"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Mã số thuế
                </label>
                <input
                  id="ct-taxCode"
                  type="text"
                  value={form.taxCode || ''}
                  onChange={(e) => setField('taxCode', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-invCountry"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Quốc gia
                </label>
                <input
                  id="ct-invCountry"
                  type="text"
                  value={form.invoiceCountry || 'Việt Nam'}
                  onChange={(e) => setField('invoiceCountry', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-invProvince"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tỉnh/Thành phố
                </label>
                <select
                  id="ct-invProvince"
                  value={form.invoiceProvince || ''}
                  onChange={(e) => setField('invoiceProvince', e.target.value)}
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
                  htmlFor="ct-invDistrict"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Quận/Huyện
                </label>
                <input
                  id="ct-invDistrict"
                  type="text"
                  value={form.invoiceDistrict || ''}
                  onChange={(e) => setField('invoiceDistrict', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="ct-invAddress"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Địa chỉ (Hóa đơn)
                </label>
                <input
                  id="ct-invAddress"
                  type="text"
                  value={form.invoiceAddress || ''}
                  onChange={(e) => setField('invoiceAddress', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-invLookup"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Mã tra cứu HĐĐT
                </label>
                <input
                  id="ct-invLookup"
                  type="text"
                  value={form.invoiceLookupCode || ''}
                  onChange={(e) => setField('invoiceLookupCode', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
            </div>
          </section>

          {/* 5. Thông tin hệ thống */}
          <section className="rounded-lg border border-brand-line bg-white p-4 sm:p-5">
            <h2 className="mb-4 border-b border-brand-line pb-2 text-sm font-semibold text-brand-ink">
              5. Thông tin hệ thống
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="ct-dept"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Bộ phận phụ trách
                </label>
                <select
                  id="ct-dept"
                  value={form.department || ''}
                  onChange={(e) => setField('department', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn bộ phận --</option>
                  {CRM_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ct-unit"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Đơn vị
                </label>
                <select
                  id="ct-unit"
                  value={form.unitName || ''}
                  onChange={(e) => setField('unitName', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {CRM_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ct-orderDate"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Ngày đặt hàng
                </label>
                <input
                  id="ct-orderDate"
                  type="date"
                  value={form.orderDate || ''}
                  onChange={(e) => setField('orderDate', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="ct-referrer"
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Đối tác / CTV giới thiệu
                </label>
                <input
                  id="ct-referrer"
                  type="text"
                  value={form.referrer || ''}
                  onChange={(e) => setField('referrer', e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-5 sm:col-span-2">
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
                    checked={Boolean(form.syncPriceAfterDiscount)}
                    onChange={(e) => setField('syncPriceAfterDiscount', e.target.checked)}
                    aria-label="Đồng bộ đơn giá sau chiết khấu"
                    className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Đồng bộ đơn giá sau CK</span>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
