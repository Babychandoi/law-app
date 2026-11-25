import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BadgeCheck,
  Download,
  Eye,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'react-toastify';
import useConfirm from '../../component/common/ui/useConfirm';
import crmEnterpriseApi from '../../features/crm/api';
import CrmColumnPicker, {
  type CrmColumnOption,
  usePersistedColumns,
} from '../../features/crm/CrmColumnPicker';
import CrmFilterPanel, { type CrmFilterFieldConfig } from '../../features/crm/CrmFilterPanel';
import CrmImportModal, { type CrmImportFieldMapping } from '../../features/crm/CrmImportModal';
import CrmPaginationFooter from '../../features/crm/CrmPaginationFooter';
import CrmQuickActivityPanel from '../../features/crm/CrmQuickActivityPanel';
import CrmStatusBadge, { CrmAssigneePill } from '../../features/crm/CrmStatusBadge';
import {
  CONTRACT_SAVED_PRESETS,
  CRM_DEPARTMENTS,
  EXECUTION_STATUSES,
  REVENUE_STATUSES,
} from '../../features/crm/constants';
import { exportRowsToCsv, formatDateVi, formatVnd } from '../../features/crm/formatters';
import type { CrmContractDto, CrmContractSummaryDto, PageMeta } from '../../features/crm/types';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

const CONTRACT_COLUMNS: CrmColumnOption[] = [
  { key: 'bookingDate', label: 'Ngày ghi sổ' },
  { key: 'paymentDate', label: 'Ngày thanh toán' },
  { key: 'goodsSummary', label: 'Hàng hóa' },
  { key: 'revenueStatus', label: 'Tình trạng ghi doanh số' },
  { key: 'executionStatus', label: 'Tình trạng thực hiện HĐ' },
  { key: 'assignedUserName', label: 'Người phụ trách' },
  { key: 'contractNumber', label: 'Số Hợp đồng', locked: true },
  { key: 'accountName', label: 'Khách hàng', locked: true },
  { key: 'orderValue', label: 'Giá trị đơn hàng' },
  { key: 'collectedAmount', label: 'Thực thu' },
  { key: 'actualExpense', label: 'Thực chi' },
  { key: 'plannedExpense', label: 'Dự kiến chi' },
  { key: 'receivableAmount', label: 'Còn phải thu' },
  { key: 'payableAmount', label: 'Còn phải chi' },
  { key: 'estimatedProfit', label: 'Dự kiến lãi lỗ' },
  { key: 'department', label: 'Bộ phận phụ trách' },
];

const CONTRACT_IMPORT_MAPPINGS: CrmImportFieldMapping[] = [
  {
    field: 'contractNumber',
    label: 'Số Hợp đồng',
    aliases: ['Mã HĐ', 'Số HĐ'],
  },
  {
    field: 'accountName',
    label: 'Khách hàng',
    aliases: ['Tên khách hàng'],
    required: true,
  },
  {
    field: 'goodsSummary',
    label: 'Hàng hóa',
    aliases: ['Dịch vụ', 'Nội dung'],
  },
  {
    field: 'orderValue',
    label: 'Giá trị đơn hàng',
    aliases: ['Tổng tiền', 'Giá trị HĐ'],
  },
  {
    field: 'collectedAmount',
    label: 'Thực thu',
    aliases: ['Đã thu'],
  },
  {
    field: 'revenueStatus',
    label: 'Tình trạng ghi doanh số',
    aliases: ['Ghi doanh số'],
  },
  {
    field: 'executionStatus',
    label: 'Tình trạng thực hiện HĐ',
    aliases: ['Tiến độ'],
  },
  {
    field: 'bookingDate',
    label: 'Ngày ghi sổ',
    aliases: ['Ngày ký'],
  },
];

export default function ContractListPage() {
  const { staffList } = useCrmWorkspace();
  const { confirm, confirmDialog } = useConfirm();

  const [rows, setRows] = useState<CrmContractDto[]>([]);
  const [summary, setSummary] = useState<CrmContractSummaryDto>({
    totalRecords: 0,
    totalOrderValue: 0,
    totalCollected: 0,
    totalReceivable: 0,
    totalEstimatedProfit: 0,
  });
  const [meta, setMeta] = useState<PageMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [activePreset, setActivePreset] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeContract, setActiveContract] = useState<CrmContractDto | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { visibleKeys, toggleColumn, resetColumns } = usePersistedColumns(
    'luatpoip.crm.contract.columns',
    CONTRACT_COLUMNS
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(0);
    }, 250);
    return () => clearTimeout(t);
  }, [keyword]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crmEnterpriseApi.listContracts({
        keyword: debouncedKeyword || undefined,
        revenueStatus: filterValues.revenueStatus || undefined,
        executionStatus: filterValues.executionStatus || undefined,
        assignedTo: filterValues.assignedTo || undefined,
        department: filterValues.department || undefined,
        bookingFrom: filterValues.bookingFrom || undefined,
        bookingTo: filterValues.bookingTo || undefined,
        paymentFrom: filterValues.paymentFrom || undefined,
        paymentTo: filterValues.paymentTo || undefined,
        preset: activePreset || undefined,
        page,
        size: pageSize,
      });
      setRows(res.rows);
      setSummary(res.summary);
      setMeta(res.meta);
      setSelectedIds([]);
      setActiveContract((prev) =>
        prev
          ? (res.rows.find((r) => r.id === prev.id) ?? res.rows[0] ?? null)
          : (res.rows[0] ?? null)
      );
    } catch {
      toast.error('Không tải được danh sách Hợp đồng');
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, filterValues, activePreset, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterFields = useMemo<CrmFilterFieldConfig[]>(
    () => [
      {
        key: 'revenueStatus',
        label: 'Tình trạng ghi doanh số',
        type: 'select',
        options: REVENUE_STATUSES,
      },
      {
        key: 'executionStatus',
        label: 'Tình trạng thực hiện HĐ',
        type: 'select',
        options: EXECUTION_STATUSES,
      },
      {
        key: 'assignedTo',
        label: 'Người phụ trách',
        type: 'select',
        options: staffList.map((u) => ({ value: u.id, label: u.fullName || u.username })),
      },
      {
        key: 'department',
        label: 'Bộ phận phụ trách',
        type: 'select',
        options: CRM_DEPARTMENTS,
      },
      {
        key: 'bookingFrom',
        toKey: 'bookingTo',
        label: 'Ngày ghi sổ',
        type: 'dateRange',
      },
      {
        key: 'paymentFrom',
        toKey: 'paymentTo',
        label: 'Ngày thanh toán',
        type: 'dateRange',
      },
    ],
    [staffList]
  );

  const handleBulkProposeRevenue = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => crmEnterpriseApi.updateContractRevenueStatus(id, 'Đề nghị ghi'))
      );
      toast.success(`Đã đề nghị ghi doanh số ${selectedIds.length} hợp đồng`);
      loadData();
    } catch {
      toast.error('Không thể cập nhật tình trạng ghi doanh số');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: 'Xóa Hợp đồng đã chọn',
      message: `Xóa ${selectedIds.length} hợp đồng đã chọn?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await Promise.all(selectedIds.map((id) => crmEnterpriseApi.deleteContract(id)));
      toast.success(`Đã xóa ${selectedIds.length} hợp đồng`);
      loadData();
    } catch {
      toast.error('Không thể xóa hợp đồng đã chọn');
    }
  };

  const handleDeleteSingle = async (row: CrmContractDto) => {
    const ok = await confirm({
      title: 'Xóa Hợp đồng',
      message: `Xóa hợp đồng "${row.contractNumber}" của "${row.accountName || ''}"?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await crmEnterpriseApi.deleteContract(row.id);
      toast.success('Đã xóa Hợp đồng');
      loadData();
    } catch {
      toast.error('Không thể xóa Hợp đồng');
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv(
      'danh-sach-hop-dong.csv',
      [
        { header: 'Ngày ghi sổ', accessor: (r) => formatDateVi(r.bookingDate) },
        { header: 'Ngày thanh toán', accessor: (r) => formatDateVi(r.paymentDate) },
        { header: 'Hàng hóa', accessor: (r) => r.goodsSummary },
        { header: 'Tình trạng ghi doanh số', accessor: (r) => r.revenueStatus },
        { header: 'Tình trạng thực hiện HĐ', accessor: (r) => r.executionStatus },
        { header: 'Người phụ trách', accessor: (r) => r.assignedUserName },
        { header: 'Số Hợp đồng', accessor: (r) => r.contractNumber },
        { header: 'Khách hàng', accessor: (r) => r.accountName },
        { header: 'Giá trị đơn hàng', accessor: (r) => r.orderValue },
        { header: 'Thực thu', accessor: (r) => r.collectedAmount },
        { header: 'Thực chi', accessor: (r) => r.actualExpense },
        { header: 'Dự kiến chi', accessor: (r) => r.plannedExpense },
        { header: 'Còn phải thu', accessor: (r) => r.receivableAmount },
        { header: 'Còn phải chi', accessor: (r) => r.payableAmount },
        { header: 'Dự kiến lãi lỗ', accessor: (r) => r.estimatedProfit },
        { header: 'Bộ phận phụ trách', accessor: (r) => r.department },
      ],
      rows
    );
  };

  const isColVisible = (key: string) => visibleKeys.includes(key);

  return (
    <div className="flex h-full flex-col overflow-hidden px-3 pb-3 pt-2.5 sm:px-4">
      {confirmDialog}

      {/* Sub-header */}
      <div className="mb-2.5 flex min-h-[44px] flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-lg font-semibold text-brand-ink">Tất cả Hợp đồng</h1>
          <select
            aria-label="Bộ lọc lưu sẵn cho Hợp đồng"
            value={activePreset}
            onChange={(e) => {
              setActivePreset(e.target.value);
              setPage(0);
            }}
            className="h-8 rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <option value="">Tất cả hợp đồng</option>
            {CONTRACT_SAVED_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Upload size={14} className="text-brand-primary" aria-hidden="true" />
            <span>Nhập từ Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-medium text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Download size={14} className="text-brand-muted" aria-hidden="true" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>

          <Link
            to={`${CRM_BASE}/sale-order/new`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Thêm</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-brand-line bg-white">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line px-3 py-2">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-sm">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm số hợp đồng PD..., khách hàng, dịch vụ, MST..."
                  aria-label="Tìm kiếm Hợp đồng"
                  className="h-8 w-full rounded-md border border-brand-line bg-brand-surface pl-8 pr-3 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2.5 rounded-md bg-brand-surface px-2.5 py-1 text-xs">
                  <span className="font-semibold tabular-nums text-brand-ink">
                    Đã chọn {selectedIds.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleBulkProposeRevenue}
                    className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <BadgeCheck size={13} aria-hidden="true" />
                    <span>Đề nghị ghi DS</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-1 font-semibold text-[#9f1239] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    <span>Xóa</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={loadData}
                aria-label="Tải lại danh sách Hợp đồng"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <RefreshCw size={14} aria-hidden="true" />
              </button>

              <CrmColumnPicker
                columns={CONTRACT_COLUMNS}
                visibleKeys={visibleKeys}
                onToggle={toggleColumn}
                onReset={resetColumns}
              />

              <button
                type="button"
                onClick={() => setShowActivity((v) => !v)}
                aria-pressed={showActivity}
                aria-label="Bật tắt khung xem nhanh hoạt động"
                className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                  showActivity
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-brand-line bg-white text-brand-ink hover:bg-brand-surface'
                }`}
              >
                <Activity size={14} aria-hidden="true" />
                <span className="hidden md:inline">Hoạt động</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilter((v) => !v)}
                aria-pressed={showFilter}
                aria-label="Hiện hoặc ẩn bộ lọc"
                className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                  showFilter
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-brand-line bg-white text-brand-ink hover:bg-brand-surface'
                }`}
              >
                <Filter size={14} aria-hidden="true" />
                <span className="hidden md:inline">Hiện bộ lọc</span>
              </button>
            </div>
          </div>

          {/* 16-column MISA Contract Table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="min-w-[2050px] w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 z-20 border-b border-brand-line bg-brand-surface text-brand-ink">
                <tr>
                  <th className="sticky left-0 z-30 w-10 border-r border-brand-line bg-brand-surface px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selectedIds.length === rows.length}
                      onChange={() =>
                        setSelectedIds(
                          selectedIds.length === rows.length ? [] : rows.map((r) => r.id)
                        )
                      }
                      aria-label="Chọn tất cả Hợp đồng trên trang"
                      className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                    />
                  </th>
                  {isColVisible('bookingDate') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Ngày ghi sổ</th>
                  )}
                  {isColVisible('paymentDate') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Ngày thanh toán</th>
                  )}
                  {isColVisible('goodsSummary') && (
                    <th className="min-w-[210px] px-3 py-2.5 font-bold">Hàng hóa</th>
                  )}
                  {isColVisible('revenueStatus') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                      Tình trạng ghi doanh số
                    </th>
                  )}
                  {isColVisible('executionStatus') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                      Tình trạng thực hiện HĐ
                    </th>
                  )}
                  {isColVisible('assignedUserName') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Người phụ trách</th>
                  )}
                  {isColVisible('contractNumber') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Số Hợp đồng</th>
                  )}
                  {isColVisible('accountName') && (
                    <th className="min-w-[210px] px-3 py-2.5 font-bold">Khách hàng</th>
                  )}
                  {isColVisible('orderValue') && (
                    <th className="whitespace-nowrap px-3 py-2.5 text-right font-bold">
                      Giá trị đơn hàng
                    </th>
                  )}
                  {isColVisible('collectedAmount') && (
                    <th className="whitespace-nowrap px-3 py-2.5 text-right font-bold">Thực thu</th>
                  )}
                  {isColVisible('actualExpense') && (
                    <th className="whitespace-nowrap px-3 py-2.5 text-right font-bold">Thực chi</th>
                  )}
                  {isColVisible('plannedExpense') && (
                    <th className="whitespace-nowrap px-3 py-2.5 text-right font-bold">
                      Dự kiến chi
                    </th>
                  )}
                  {isColVisible('receivableAmount') && (
                    <th className="whitespace-nowrap px-3 py-2.5 text-right font-bold">
                      Còn phải thu
                    </th>
                  )}
                  {isColVisible('payableAmount') && (
                    <th className="whitespace-nowrap px-3 py-2.5 text-right font-bold">
                      Còn phải chi
                    </th>
                  )}
                  {isColVisible('estimatedProfit') && (
                    <th className="whitespace-nowrap px-3 py-2.5 text-right font-bold">
                      Dự kiến lãi lỗ
                    </th>
                  )}
                  {isColVisible('department') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Bộ phận phụ trách</th>
                  )}
                  <th className="sticky right-0 z-30 w-28 border-l border-brand-line bg-brand-surface px-2.5 py-2.5 text-center font-bold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-line">
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={18} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-brand-surface" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="px-6 py-14 text-center">
                      <p className="text-sm font-semibold text-brand-ink">
                        Chưa có Hợp đồng phù hợp điều kiện lọc
                      </p>
                      <p className="mt-1 text-xs text-brand-muted">
                        Nhấn &ldquo;+ Thêm&rdquo; để lập hợp đồng dịch vụ pháp lý hoặc sinh tự động
                        từ Cơ hội HĐ / Khách hàng.
                      </p>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const isSelected = selectedIds.includes(row.id);
                    const isCurrent = activeContract?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setActiveContract(row)}
                        className={`cursor-pointer transition-colors ${
                          isSelected || isCurrent
                            ? 'bg-brand-surface'
                            : 'bg-white hover:bg-brand-surface/60'
                        }`}
                      >
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="sticky left-0 z-10 border-r border-brand-line bg-inherit px-3 py-2 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              setSelectedIds((prev) =>
                                prev.includes(row.id)
                                  ? prev.filter((x) => x !== row.id)
                                  : [...prev, row.id]
                              )
                            }
                            aria-label={`Chọn hợp đồng ${row.contractNumber}`}
                            className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                          />
                        </td>

                        {isColVisible('bookingDate') && (
                          <td className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-ink">
                            {formatDateVi(row.bookingDate)}
                          </td>
                        )}

                        {isColVisible('paymentDate') && (
                          <td className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-muted">
                            {formatDateVi(row.paymentDate)}
                          </td>
                        )}

                        {isColVisible('goodsSummary') && (
                          <td className="max-w-[240px] truncate px-3 py-2 text-brand-ink">
                            {row.goodsSummary ||
                              row.items?.map((i) => i.description).join(', ') ||
                              '—'}
                          </td>
                        )}

                        {isColVisible('revenueStatus') && (
                          <td className="px-3 py-2">
                            <CrmStatusBadge status={row.revenueStatus} />
                          </td>
                        )}

                        {isColVisible('executionStatus') && (
                          <td className="px-3 py-2">
                            <CrmStatusBadge status={row.executionStatus} />
                          </td>
                        )}

                        {isColVisible('assignedUserName') && (
                          <td className="px-3 py-2">
                            <CrmAssigneePill name={row.assignedUserName} />
                          </td>
                        )}

                        {isColVisible('contractNumber') && (
                          <td className="whitespace-nowrap px-3 py-2">
                            <Link
                              to={`${CRM_BASE}/sale-order/${row.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold tabular-nums text-brand-primary hover:underline"
                            >
                              {row.contractNumber}
                            </Link>
                          </td>
                        )}

                        {isColVisible('accountName') && (
                          <td className="max-w-[230px] truncate px-3 py-2">
                            {row.accountId ? (
                              <Link
                                to={`${CRM_BASE}/account/${row.accountId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-medium text-brand-ink hover:text-brand-primary hover:underline"
                              >
                                {row.accountName || '—'}
                              </Link>
                            ) : (
                              <span className="text-brand-ink">{row.accountName || '—'}</span>
                            )}
                          </td>
                        )}

                        {isColVisible('orderValue') && (
                          <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-brand-ink">
                            {formatVnd(row.orderValue)}
                          </td>
                        )}

                        {isColVisible('collectedAmount') && (
                          <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-[#065f46]">
                            {formatVnd(row.collectedAmount)}
                          </td>
                        )}

                        {isColVisible('actualExpense') && (
                          <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-brand-ink">
                            {formatVnd(row.actualExpense)}
                          </td>
                        )}

                        {isColVisible('plannedExpense') && (
                          <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-brand-muted">
                            {formatVnd(row.plannedExpense)}
                          </td>
                        )}

                        {isColVisible('receivableAmount') && (
                          <td className="whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums text-[#9f1239]">
                            {formatVnd(row.receivableAmount)}
                          </td>
                        )}

                        {isColVisible('payableAmount') && (
                          <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-brand-muted">
                            {formatVnd(row.payableAmount)}
                          </td>
                        )}

                        {isColVisible('estimatedProfit') && (
                          <td
                            className={`whitespace-nowrap px-3 py-2 text-right font-bold tabular-nums ${
                              row.estimatedProfit >= 0 ? 'text-[#065f46]' : 'text-[#9f1239]'
                            }`}
                          >
                            {formatVnd(row.estimatedProfit)}
                          </td>
                        )}

                        {isColVisible('department') && (
                          <td className="whitespace-nowrap px-3 py-2 text-brand-muted">
                            {row.department || '—'}
                          </td>
                        )}

                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="sticky right-0 z-10 border-l border-brand-line bg-inherit px-2 py-2"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              to={`${CRM_BASE}/sale-order/${row.id}`}
                              aria-label={`Xem hợp đồng ${row.contractNumber}`}
                              title="Xem chi tiết & Thu chi"
                              className="rounded p-1 text-brand-primary hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <Eye size={14} aria-hidden="true" />
                            </Link>
                            <Link
                              to={`${CRM_BASE}/sale-order/${row.id}/edit`}
                              aria-label={`Sửa hợp đồng ${row.contractNumber}`}
                              title="Sửa"
                              className="rounded p-1 text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(row)}
                              aria-label={`Xóa hợp đồng ${row.contractNumber}`}
                              title="Xóa"
                              className="rounded p-1 text-brand-muted hover:bg-[#ffe4e6] hover:text-[#9f1239] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Real-Time KPI Summary & Pagination Footer */}
          <CrmPaginationFooter
            totalElements={summary.totalRecords || meta?.totalElements || rows.length}
            page={page}
            pageSize={pageSize}
            totalPages={meta?.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(0);
            }}
            kpis={[
              {
                label: 'Giá trị đơn hàng',
                value: formatVnd(summary.totalOrderValue),
                tone: 'default',
              },
              {
                label: 'Thực thu',
                value: formatVnd(summary.totalCollected),
                tone: 'emerald',
              },
              {
                label: 'Còn phải thu',
                value: formatVnd(summary.totalReceivable),
                tone: 'rose',
              },
              {
                label: 'Dự kiến lãi lỗ',
                value: formatVnd(summary.totalEstimatedProfit),
                tone: summary.totalEstimatedProfit >= 0 ? 'teal' : 'rose',
              },
            ]}
          />
        </div>

        {showActivity && (
          <CrmQuickActivityPanel
            docked
            entityType="CONTRACT"
            entityId={activeContract?.id}
            entityLabel={activeContract?.contractNumber}
            onClose={() => setShowActivity(false)}
          />
        )}

        <CrmFilterPanel
          open={showFilter}
          onClose={() => setShowFilter(false)}
          presets={CONTRACT_SAVED_PRESETS}
          activePresetId={activePreset}
          onSelectPreset={(id) => {
            setActivePreset(id);
            setPage(0);
          }}
          fields={filterFields}
          values={filterValues}
          onApply={(next) => {
            setFilterValues(next);
            setPage(0);
          }}
          onReset={() => {
            setFilterValues({});
            setActivePreset('');
            setPage(0);
          }}
        />
      </div>

      <CrmImportModal
        open={showImport}
        title="Nhập danh sách Hợp đồng từ Excel / CSV"
        sampleCsvHeader="Số Hợp đồng,Khách hàng,Hàng hóa,Giá trị đơn hàng,Thực thu,Tình trạng ghi doanh số,Tình trạng thực hiện HĐ,Ngày ghi sổ"
        sampleCsvRow="PD2026-001,Công ty Cổ phần Sao Việt,Đăng ký nhãn hiệu độc quyền 2 nhóm,12000000,6000000,Đề nghị ghi,Đang chuẩn bị hồ sơ,2026-11-25"
        mappings={CONTRACT_IMPORT_MAPPINGS}
        onClose={() => setShowImport(false)}
        onImport={(items) => crmEnterpriseApi.importContracts(items)}
        onSuccess={loadData}
      />
    </div>
  );
}
