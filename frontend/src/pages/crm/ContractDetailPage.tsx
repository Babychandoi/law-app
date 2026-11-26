import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  FolderKanban,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../component/common/ui/Spinner';
import useConfirm from '../../component/common/ui/useConfirm';
import crmEnterpriseApi from '../../features/crm/api';
import CrmLineItemsEditor from '../../features/crm/CrmLineItemsEditor';
import CrmQuickActivityPanel from '../../features/crm/CrmQuickActivityPanel';
import CrmStatusBadge, { CrmAssigneePill } from '../../features/crm/CrmStatusBadge';
import { CASHFLOW_TYPES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../features/crm/constants';
import {
  formatDateTimeVi,
  formatDateVi,
  formatStaffActor,
  formatVnd,
  toDateInputValue,
} from '../../features/crm/formatters';
import type {
  CrmCashflowLedgerType,
  CrmContractCashflowDto,
  CrmContractDto,
} from '../../features/crm/types';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

type ContractDetailTab = 'services' | 'detail' | 'cashflow' | 'activities';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { staffList } = useCrmWorkspace();
  const { confirm, confirmDialog } = useConfirm();

  const [contract, setContract] = useState<CrmContractDto | null>(null);
  const [cashflows, setCashflows] = useState<CrmContractCashflowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ContractDetailTab>('services');
  const [activeLedger, setActiveLedger] = useState<CrmCashflowLedgerType>('THUC_THU');
  const [fieldQuery, setFieldQuery] = useState('');
  const [showEmptyFields, setShowEmptyFields] = useState(true);

  const [cfTitle, setCfTitle] = useState('');
  const [cfAmount, setCfAmount] = useState<number>(0);
  const [cfDate, setCfDate] = useState(() => toDateInputValue(new Date().toISOString()));
  const [cfMethod, setCfMethod] = useState(PAYMENT_METHODS[0]);
  const [cfExpenseCategory, setCfExpenseCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [cfReferenceCode, setCfReferenceCode] = useState('');
  const [cfNotes, setCfNotes] = useState('');
  const [savingCf, setSavingCf] = useState(false);

  const loadContractAndCashflows = useCallback(async () => {
    if (!id) return;
    try {
      const [cData, cfData] = await Promise.all([
        crmEnterpriseApi.getContract(id),
        crmEnterpriseApi.listContractCashflows(id).catch(() => []),
      ]);
      setContract(cData);
      setCashflows(cfData);
    } catch {
      toast.error('Không tìm thấy Hợp đồng');
      navigate(`${CRM_BASE}/sale-order`);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    setLoading(true);
    loadContractAndCashflows();
  }, [loadContractAndCashflows]);

  const handleRevenueStatusAction = async (nextStatus: string) => {
    if (!contract) return;
    try {
      const updated = await crmEnterpriseApi.updateContractRevenueStatus(contract.id, nextStatus);
      setContract(updated);
      toast.success(`Đã chuyển tình trạng doanh số: ${nextStatus}`);
    } catch {
      toast.error('Không thể cập nhật tình trạng ghi doanh số');
    }
  };

  const handleDeleteContract = async () => {
    if (!contract) return;
    const ok = await confirm({
      title: 'Xóa Hợp đồng',
      message: `Xóa hợp đồng "${contract.contractNumber}"?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await crmEnterpriseApi.deleteContract(contract.id);
      toast.success('Đã xóa Hợp đồng');
      navigate(`${CRM_BASE}/sale-order`);
    } catch {
      toast.error('Không thể xóa Hợp đồng');
    }
  };

  const handleAddCashflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !cfTitle.trim() || cfAmount <= 0) {
      toast.error('Vui lòng nhập diễn giải và số tiền lớn hơn 0');
      return;
    }
    setSavingCf(true);
    try {
      await crmEnterpriseApi.createContractCashflow(contract.id, {
        flowType: activeLedger,
        title: cfTitle.trim(),
        amount: cfAmount,
        transactionDate: cfDate,
        paymentMethod: cfMethod,
        expenseCategory: activeLedger !== 'THUC_THU' ? cfExpenseCategory : undefined,
        referenceCode: cfReferenceCode.trim() || undefined,
        notes: cfNotes.trim() || undefined,
      });
      toast.success('Đã ghi nhận bút toán thu chi và cập nhật lãi lỗ hợp đồng');
      setCfTitle('');
      setCfAmount(0);
      setCfReferenceCode('');
      setCfNotes('');
      await loadContractAndCashflows();
    } catch {
      toast.error('Không thể ghi nhận bút toán thu chi');
    } finally {
      setSavingCf(false);
    }
  };

  const handleDeleteCashflow = async (cashflowId: string) => {
    if (!contract) return;
    try {
      await crmEnterpriseApi.deleteContractCashflow(contract.id, cashflowId);
      toast.success('Đã xóa bút toán thu chi');
      await loadContractAndCashflows();
    } catch {
      toast.error('Không thể xóa bút toán thu chi');
    }
  };

  const filteredLedgerRows = useMemo(
    () => cashflows.filter((cf) => cf.flowType === activeLedger),
    [cashflows, activeLedger]
  );

  const ledgerTotals = useMemo(() => {
    const sumBy = (t: CrmCashflowLedgerType) =>
      cashflows.filter((c) => c.flowType === t).reduce((s, c) => s + c.amount, 0);
    return {
      THUC_THU: sumBy('THUC_THU'),
      DU_KIEN_CHI: sumBy('DU_KIEN_CHI'),
      THUC_CHI: sumBy('THUC_CHI'),
    };
  }, [cashflows]);

  const detailSections = useMemo(() => {
    if (!contract) return [];
    const q = fieldQuery.trim().toLowerCase();
    const filterItems = (items: { label: string; value: React.ReactNode; rawText?: string }[]) =>
      items.filter((it) => {
        if (!showEmptyFields && (!it.rawText || it.rawText === '—')) return false;
        if (!q) return true;
        return it.label.toLowerCase().includes(q) || (it.rawText ?? '').toLowerCase().includes(q);
      });

    return [
      {
        title: '1. Thông tin chung',
        items: filterItems([
          {
            label: 'Số Hợp đồng',
            value: contract.contractNumber,
            rawText: contract.contractNumber,
          },
          {
            label: 'Khách hàng',
            value: contract.accountName || '—',
            rawText: contract.accountName || '',
          },
          {
            label: 'Liên hệ',
            value: contract.contactName || '—',
            rawText: contract.contactName || '',
          },
          {
            label: 'Giá trị đơn hàng',
            value: formatVnd(contract.orderValue, true),
            rawText: String(contract.orderValue),
          },
          {
            label: 'Giá trị thanh lý',
            value: formatVnd(contract.liquidationValue, true),
            rawText: contract.liquidationValue ? String(contract.liquidationValue) : '',
          },
          {
            label: 'Nguồn gốc KH',
            value: contract.leadSource || '—',
            rawText: contract.leadSource || '',
          },
          {
            label: 'Nguồn gốc Hợp đồng',
            value: contract.contractSource || '—',
            rawText: contract.contractSource || '',
          },
          {
            label: 'Ngày nộp hồ sơ',
            value: formatDateVi(contract.submissionDate),
            rawText: contract.submissionDate || '',
          },
          {
            label: 'Hạn bàn giao KQ',
            value: formatDateVi(contract.handoverDeadline),
            rawText: contract.handoverDeadline || '',
          },
          {
            label: 'Người phụ trách',
            value: <CrmAssigneePill name={contract.assignedUserName} />,
            rawText: contract.assignedUserName || '',
          },
          {
            label: 'HĐ Lưu',
            value: contract.archivedStatus || 'Chưa có',
            rawText: contract.archivedStatus || '',
          },
          {
            label: 'Tình trạng thực hiện HĐ',
            value: <CrmStatusBadge status={contract.executionStatus} />,
            rawText: contract.executionStatus,
          },
          {
            label: 'Loại điều khoản TT',
            value: contract.paymentTermType || '—',
            rawText: contract.paymentTermType || '',
          },
          {
            label: 'Hợp đồng cha / liên quan',
            value: contract.parentContractNumber || '—',
            rawText: contract.parentContractNumber || '',
          },
        ]),
      },
      {
        title: '2. Thông tin giá trị hợp đồng',
        items: filterItems([
          {
            label: 'Tóm tắt hàng hóa / dịch vụ',
            value: contract.goodsSummary || '—',
            rawText: contract.goodsSummary || '',
          },
          {
            label: 'Số dòng dịch vụ',
            value: `${contract.items?.length ?? 0} dòng`,
            rawText: String(contract.items?.length ?? 0),
          },
        ]),
      },
      {
        title: '3. Thông tin thu chi hợp đồng',
        items: filterItems([
          {
            label: 'Ngày ghi sổ',
            value: formatDateVi(contract.bookingDate),
            rawText: contract.bookingDate || '',
          },
          {
            label: 'Ngày thanh toán',
            value: formatDateVi(contract.paymentDate),
            rawText: contract.paymentDate || '',
          },
          {
            label: 'Tình trạng ghi doanh số',
            value: <CrmStatusBadge status={contract.revenueStatus} />,
            rawText: contract.revenueStatus,
          },
          {
            label: 'Thực thu',
            value: formatVnd(contract.collectedAmount, true),
            rawText: String(contract.collectedAmount),
          },
          {
            label: 'Còn phải thu',
            value: formatVnd(contract.receivableAmount, true),
            rawText: String(contract.receivableAmount),
          },
          {
            label: 'Dự kiến chi',
            value: formatVnd(contract.plannedExpense, true),
            rawText: String(contract.plannedExpense),
          },
          {
            label: 'Thực chi',
            value: formatVnd(contract.actualExpense, true),
            rawText: String(contract.actualExpense),
          },
          {
            label: 'Còn phải chi',
            value: formatVnd(contract.payableAmount, true),
            rawText: String(contract.payableAmount),
          },
          {
            label: 'Chi dịch vụ',
            value: formatVnd(contract.serviceExpense, true),
            rawText: String(contract.serviceExpense),
          },
          {
            label: 'Chi nhà nước',
            value: formatVnd(contract.stateFeeExpense, true),
            rawText: String(contract.stateFeeExpense),
          },
          {
            label: 'Chi hỗ trợ',
            value: formatVnd(contract.supportExpense, true),
            rawText: String(contract.supportExpense),
          },
          {
            label: 'Dự kiến lãi lỗ',
            value: formatVnd(contract.estimatedProfit, true),
            rawText: String(contract.estimatedProfit),
          },
          {
            label: 'Hạn sản xuất',
            value: formatDateVi(contract.productionDeadline),
            rawText: contract.productionDeadline || '',
          },
        ]),
      },
      {
        title: '4. Thông tin hóa đơn',
        items: filterItems([
          {
            label: 'Khách hàng (Hóa đơn)',
            value: contract.invoiceCustomerName || contract.accountName || '—',
            rawText: contract.invoiceCustomerName || '',
          },
          {
            label: 'Người mua hàng',
            value: contract.buyerName || '—',
            rawText: contract.buyerName || '',
          },
          { label: 'Mã số thuế', value: contract.taxCode || '—', rawText: contract.taxCode || '' },
          {
            label: 'Quốc gia',
            value: contract.invoiceCountry || 'Việt Nam',
            rawText: contract.invoiceCountry || 'Việt Nam',
          },
          {
            label: 'Tỉnh/Thành phố',
            value: contract.invoiceProvince || '—',
            rawText: contract.invoiceProvince || '',
          },
          {
            label: 'Quận/Huyện',
            value: contract.invoiceDistrict || '—',
            rawText: contract.invoiceDistrict || '',
          },
          {
            label: 'Địa chỉ (Hóa đơn)',
            value: contract.invoiceAddress || '—',
            rawText: contract.invoiceAddress || '',
          },
          {
            label: 'Mã tra cứu HĐĐT',
            value: contract.invoiceLookupCode || '—',
            rawText: contract.invoiceLookupCode || '',
          },
        ]),
      },
      {
        title: '5. Thông tin hệ thống',
        items: filterItems([
          {
            label: 'Bộ phận phụ trách',
            value: contract.department || '—',
            rawText: contract.department || '',
          },
          { label: 'Đơn vị', value: contract.unitName || '—', rawText: contract.unitName || '' },
          {
            label: 'Ngày đặt hàng',
            value: formatDateVi(contract.orderDate),
            rawText: contract.orderDate || '',
          },
          {
            label: 'Dùng chung',
            value: contract.shared ? 'Có' : 'Không',
            rawText: contract.shared ? 'Có' : 'Không',
          },
          {
            label: 'Đối tác/CTV giới thiệu',
            value: contract.referrer || '—',
            rawText: contract.referrer || '',
          },
          {
            label: 'Đồng bộ đơn giá sau CK',
            value: contract.syncPriceAfterDiscount ? 'Có' : 'Không',
            rawText: contract.syncPriceAfterDiscount ? 'Có' : 'Không',
          },
          {
            label: 'Ngày tạo',
            value: formatDateTimeVi(contract.createdAt),
            rawText: contract.createdAt || '',
          },
        ]),
      },
    ].filter((s) => s.items.length > 0);
  }, [contract, fieldQuery, showEmptyFields]);

  if (loading || !contract) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Đang tải chi tiết Hợp đồng" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {confirmDialog}

      {/* Contract Detail Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`${CRM_BASE}/sale-order`}
            aria-label="Quay lại danh sách Hợp đồng"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold tabular-nums text-brand-ink sm:text-lg">
                {contract.contractNumber}
              </h1>
              <span className="text-base font-bold tabular-nums text-[#065f46] sm:text-lg">
                · {formatVnd(contract.orderValue, true)}
              </span>
              <CrmStatusBadge status={contract.revenueStatus} />
              <CrmStatusBadge status={contract.executionStatus} />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
              {contract.accountId ? (
                <Link
                  to={`${CRM_BASE}/account/${contract.accountId}`}
                  className="font-semibold text-brand-primary hover:underline"
                >
                  KH: {contract.accountName || contract.accountCode}
                </Link>
              ) : (
                <span>KH: {contract.accountName || '—'}</span>
              )}
              <span className="tabular-nums">Ghi sổ: {formatDateVi(contract.bookingDate)}</span>
              <span>Phụ trách: {contract.assignedUserName || '—'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-medium text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Printer size={14} aria-hidden="true" />
            <span>In</span>
          </button>

          <Link
            to="/2025/luatpoip/tai-lieu"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-medium text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <FolderKanban size={14} className="text-brand-primary" aria-hidden="true" />
            <span className="hidden sm:inline">Soạn biểu mẫu HĐ</span>
          </Link>

          <Link
            to={`${CRM_BASE}/sale-order/${contract.id}/edit`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Pencil size={13} aria-hidden="true" />
            <span>Sửa</span>
          </Link>

          {contract.revenueStatus === 'Bản nháp' && (
            <button
              type="button"
              onClick={() => handleRevenueStatusAction('Đề nghị ghi')}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <BadgeCheck size={14} aria-hidden="true" />
              <span>Đề nghị ghi DS</span>
            </button>
          )}

          {contract.revenueStatus === 'Đề nghị ghi' && (
            <button
              type="button"
              onClick={() => handleRevenueStatusAction('Đã ghi')}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <CheckCircle2 size={14} aria-hidden="true" />
              <span>Duyệt ghi DS</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDeleteContract}
            aria-label="Xóa Hợp đồng"
            className="inline-flex h-8 items-center rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-[#9f1239] hover:bg-[#ffe4e6]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4">
        <div className="flex flex-1 flex-col rounded-lg border border-brand-line bg-white">
          {/* Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line px-4">
            <div role="tablist" aria-label="Chi tiết Hợp đồng" className="flex flex-wrap gap-5">
              {(
                [
                  { id: 'services', label: `Dịch vụ (${contract.items?.length ?? 0})` },
                  { id: 'detail', label: 'Thông tin chi tiết' },
                  { id: 'cashflow', label: `Thu chi (${cashflows.length})` },
                  { id: 'activities', label: 'Hoạt động' },
                ] as { id: ContractDetailTab; label: string }[]
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
                    aria-label="Tìm kiếm trường hợp đồng"
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

          <div className="flex-1 p-4 sm:p-5">
            {/* Tab 1: Dịch vụ (Default) */}
            {activeTab === 'services' && (
              <div className="space-y-5">
                {/* Financial KPI Summary Strip */}
                <div className="grid grid-cols-2 divide-y divide-brand-line rounded-lg border border-brand-line bg-brand-surface/50 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
                  <div className="p-3">
                    <div className="text-xs text-brand-muted">Giá trị đơn hàng</div>
                    <div className="mt-1 text-base font-bold tabular-nums text-brand-ink">
                      {formatVnd(contract.orderValue, true)}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-brand-muted">Thực thu</div>
                    <div className="mt-1 text-base font-bold tabular-nums text-[#065f46]">
                      {formatVnd(contract.collectedAmount, true)}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-brand-muted">Còn phải thu</div>
                    <div className="mt-1 text-base font-bold tabular-nums text-[#9f1239]">
                      {formatVnd(contract.receivableAmount, true)}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-brand-muted">Thực chi / Dự kiến chi</div>
                    <div className="mt-1 text-base font-bold tabular-nums text-brand-ink">
                      {formatVnd(contract.actualExpense)} / {formatVnd(contract.plannedExpense)}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-brand-muted">Dự kiến lãi lỗ</div>
                    <div
                      className={`mt-1 text-base font-bold tabular-nums ${
                        contract.estimatedProfit >= 0 ? 'text-brand-primary' : 'text-[#9f1239]'
                      }`}
                    >
                      {formatVnd(contract.estimatedProfit, true)}
                    </div>
                  </div>
                </div>

                <CrmLineItemsEditor items={contract.items ?? []} readOnly />
              </div>
            )}

            {/* Tab 2: Thông tin chi tiết */}
            {activeTab === 'detail' && (
              <div className="space-y-6">
                {detailSections.map((section) => (
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
                          <dd className="col-span-7 font-medium tabular-nums text-brand-ink">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
            )}

            {/* Tab 3: Sổ Thu chi (Thực thu / Dự kiến chi / Thực chi) */}
            {activeTab === 'cashflow' && (
              <div className="flex flex-col gap-4 lg:flex-row">
                {/* Left Ledger Sub-Sidebar */}
                <aside
                  aria-label="Danh mục sổ thu chi hợp đồng"
                  className="w-full shrink-0 space-y-1.5 rounded-lg border border-brand-line bg-brand-surface/50 p-2.5 lg:w-60"
                >
                  {CASHFLOW_TYPES.map((ledger) => {
                    const typeKey = ledger.value as CrmCashflowLedgerType;
                    const isSelected = activeLedger === typeKey;
                    const total = ledgerTotals[typeKey];
                    return (
                      <button
                        key={typeKey}
                        type="button"
                        onClick={() => setActiveLedger(typeKey)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                          isSelected
                            ? 'bg-brand-primary text-white'
                            : 'bg-white text-brand-ink hover:bg-brand-surface'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Wallet size={14} aria-hidden="true" />
                          <span>{ledger.label}</span>
                        </span>
                        <span className="tabular-nums">{formatVnd(total)}</span>
                      </button>
                    );
                  })}
                </aside>

                {/* Right Ledger Form & Table */}
                <div className="min-w-0 flex-1 space-y-4">
                  <form
                    onSubmit={handleAddCashflow}
                    className="space-y-3 rounded-lg border border-brand-line bg-brand-surface/40 p-4"
                  >
                    <h2 className="text-sm font-semibold text-brand-ink">
                      Ghi nhận {CASHFLOW_TYPES.find((t) => t.value === activeLedger)?.label}
                    </h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="cf-title"
                          className="mb-1 block text-xs font-semibold text-brand-ink"
                        >
                          Nội dung / Diễn giải *
                        </label>
                        <input
                          id="cf-title"
                          type="text"
                          required
                          value={cfTitle}
                          onChange={(e) => setCfTitle(e.target.value)}
                          placeholder={
                            activeLedger === 'THUC_THU'
                              ? 'Ví dụ: Thu tạm ứng đợt 1 (50% giá trị HĐ)'
                              : 'Ví dụ: Nộp lệ phí thẩm định đơn tại Cục SHTT'
                          }
                          className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="cf-amount"
                          className="mb-1 block text-xs font-semibold text-brand-ink"
                        >
                          Số tiền (VNĐ) *
                        </label>
                        <input
                          id="cf-amount"
                          type="number"
                          min={1}
                          step="any"
                          required
                          value={cfAmount || ''}
                          onChange={(e) => setCfAmount(Number(e.target.value))}
                          placeholder="0"
                          className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="cf-date"
                          className="mb-1 block text-xs font-semibold text-brand-ink"
                        >
                          Ngày chứng từ
                        </label>
                        <input
                          id="cf-date"
                          type="date"
                          value={cfDate}
                          onChange={(e) => setCfDate(e.target.value)}
                          className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="cf-method"
                          className="mb-1 block text-xs font-semibold text-brand-ink"
                        >
                          Hình thức thanh toán
                        </label>
                        <select
                          id="cf-method"
                          value={cfMethod}
                          onChange={(e) => setCfMethod(e.target.value)}
                          className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        >
                          {PAYMENT_METHODS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      {activeLedger !== 'THUC_THU' ? (
                        <div>
                          <label
                            htmlFor="cf-cat"
                            className="mb-1 block text-xs font-semibold text-brand-ink"
                          >
                            Khoản mục chi phí
                          </label>
                          <select
                            id="cf-cat"
                            value={cfExpenseCategory}
                            onChange={(e) => setCfExpenseCategory(e.target.value)}
                            className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                          >
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label
                            htmlFor="cf-ref"
                            className="mb-1 block text-xs font-semibold text-brand-ink"
                          >
                            Số chứng từ / UNC
                          </label>
                          <input
                            id="cf-ref"
                            type="text"
                            value={cfReferenceCode}
                            onChange={(e) => setCfReferenceCode(e.target.value)}
                            placeholder="PT001 / UNC..."
                            className="w-full rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <input
                        type="text"
                        aria-label="Ghi chú thêm cho bút toán"
                        value={cfNotes}
                        onChange={(e) => setCfNotes(e.target.value)}
                        placeholder="Ghi chú thêm (nếu có)..."
                        className="min-w-0 flex-1 rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                      <button
                        type="submit"
                        disabled={savingCf}
                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-brand-primary px-4 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      >
                        <Plus size={14} aria-hidden="true" />
                        <span>{savingCf ? 'Đang ghi sổ...' : 'Thêm bút toán'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Ledger Transactions Table */}
                  <div className="overflow-x-auto rounded-lg border border-brand-line">
                    <table className="min-w-full border-collapse text-left text-xs">
                      <thead className="border-b border-brand-line bg-brand-surface text-brand-ink">
                        <tr>
                          <th className="px-3 py-2.5 font-semibold">Ngày chứng từ</th>
                          <th className="px-3 py-2.5 font-semibold">Nội dung thu / chi</th>
                          <th className="px-3 py-2.5 font-semibold">Hình thức / Khoản mục</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Số tiền</th>
                          <th className="px-3 py-2.5 font-semibold">Người lập</th>
                          <th className="w-14 px-3 py-2.5 text-center font-semibold">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-line">
                        {filteredLedgerRows.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-brand-muted">
                              Chưa có bút toán nào trong sổ{' '}
                              {CASHFLOW_TYPES.find((t) => t.value === activeLedger)?.label}.
                            </td>
                          </tr>
                        ) : (
                          filteredLedgerRows.map((cf) => (
                            <tr key={cf.id} className="hover:bg-brand-surface/40">
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-ink">
                                {formatDateVi(cf.transactionDate)}
                              </td>
                              <td className="px-3 py-2">
                                <div className="font-semibold text-brand-ink">{cf.title}</div>
                                {cf.notes && (
                                  <div className="text-[11px] text-brand-muted">{cf.notes}</div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-brand-muted">
                                {cf.paymentMethod || cf.expenseCategory || '—'}
                              </td>
                              <td
                                className={`whitespace-nowrap px-3 py-2 text-right font-bold tabular-nums ${
                                  activeLedger === 'THUC_THU' ? 'text-[#065f46]' : 'text-brand-ink'
                                }`}
                              >
                                {formatVnd(cf.amount, true)}
                              </td>
                              <td className="px-3 py-2 text-brand-muted">
                                {formatStaffActor(
                                  cf.createdByName,
                                  staffList,
                                  'Kế toán / Chuyên viên'
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCashflow(cf.id)}
                                  aria-label={`Xóa bút toán ${cf.title}`}
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
              </div>
            )}

            {/* Tab 4: Hoạt động */}
            {activeTab === 'activities' && (
              <CrmQuickActivityPanel
                entityType="CONTRACT"
                entityId={contract.id}
                entityLabel={contract.contractNumber}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
