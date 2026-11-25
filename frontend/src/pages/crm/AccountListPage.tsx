import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Download,
  FilePlus2,
  Filter,
  Pencil,
  Phone,
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
  ACCOUNT_CARE_STATUSES,
  ACCOUNT_CUSTOMER_STATUSES,
  ACCOUNT_SAVED_PRESETS,
  CRM_PROVINCES,
  CRM_SERVICE_GROUPS,
} from '../../features/crm/constants';
import { exportRowsToCsv, formatDateVi } from '../../features/crm/formatters';
import type { CrmAccountDto, PageMeta } from '../../features/crm/types';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

const ACCOUNT_COLUMNS: CrmColumnOption[] = [
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'customerStatus', label: 'Trạng thái khách hàng' },
  { key: 'serviceGroups', label: 'Nhóm dịch vụ' },
  { key: 'demandDetail', label: 'Chi tiết nhu cầu KH' },
  { key: 'assignedUserName', label: 'Người phụ trách' },
  { key: 'customerName', label: 'Tên khách hàng', locked: true },
  { key: 'relatedUsers', label: 'Người liên quan' },
  { key: 'phone', label: 'Điện thoại', locked: true },
  { key: 'servicesSummary', label: 'Dịch vụ' },
  { key: 'careStatuses', label: 'Tình trạng chăm sóc KH' },
  { key: 'ownerUserName', label: 'Chủ sở hữu' },
  { key: 'billingProvince', label: 'Tỉnh/Thành phố (Hóa đơn)' },
];

const ACCOUNT_IMPORT_MAPPINGS: CrmImportFieldMapping[] = [
  {
    field: 'customerName',
    label: 'Tên khách hàng',
    aliases: ['Khách hàng', 'Tên công ty'],
    required: true,
  },
  {
    field: 'phone',
    label: 'Điện thoại',
    aliases: ['SĐT', 'Số điện thoại'],
    required: true,
  },
  {
    field: 'taxCode',
    label: 'Mã số thuế',
    aliases: ['MST'],
  },
  {
    field: 'email',
    label: 'Email',
    aliases: ['Thư điện tử'],
  },
  {
    field: 'customerStatus',
    label: 'Trạng thái khách hàng',
    aliases: ['Trạng thái'],
  },
  {
    field: 'demandDetail',
    label: 'Chi tiết nhu cầu KH',
    aliases: ['Nhu cầu'],
  },
  {
    field: 'billingProvince',
    label: 'Tỉnh/Thành phố (Hóa đơn)',
    aliases: ['Tỉnh/Thành phố', 'Tỉnh thành'],
  },
];

export default function AccountListPage() {
  const { staffList } = useCrmWorkspace();
  const { confirm, confirmDialog } = useConfirm();

  const [rows, setRows] = useState<CrmAccountDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [activePreset, setActivePreset] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeAccount, setActiveAccount] = useState<CrmAccountDto | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { visibleKeys, toggleColumn, resetColumns } = usePersistedColumns(
    'luatpoip.crm.account.columns',
    ACCOUNT_COLUMNS
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
      const presetStatus =
        activePreset === 'WON_CONTRACT'
          ? 'Đã chốt hợp đồng'
          : activePreset === 'URGENT_NEED'
            ? 'Nhu cầu cao/Gấp'
            : activePreset === 'POTENTIAL'
              ? 'Tiềm năng'
              : undefined;

      const res = await crmEnterpriseApi.listAccounts({
        keyword: debouncedKeyword || undefined,
        customerStatus: filterValues.customerStatus || presetStatus,
        careStatus: filterValues.careStatus || undefined,
        assignedTo: filterValues.assignedTo || undefined,
        serviceGroup: filterValues.serviceGroup || undefined,
        billingProvince: filterValues.billingProvince || undefined,
        from: filterValues.from || undefined,
        to: filterValues.to || undefined,
        page,
        size: pageSize,
      });
      setRows(res.rows);
      setMeta(res.meta);
      setSelectedIds([]);
      setActiveAccount((prev) =>
        prev
          ? (res.rows.find((r) => r.id === prev.id) ?? res.rows[0] ?? null)
          : (res.rows[0] ?? null)
      );
    } catch {
      toast.error('Không tải được danh sách Khách hàng');
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
        key: 'customerStatus',
        label: 'Trạng thái khách hàng',
        type: 'select',
        options: ACCOUNT_CUSTOMER_STATUSES,
      },
      {
        key: 'careStatus',
        label: 'Tình trạng chăm sóc KH',
        type: 'select',
        options: ACCOUNT_CARE_STATUSES,
      },
      {
        key: 'assignedTo',
        label: 'Người phụ trách',
        type: 'select',
        options: staffList.map((u) => ({ value: u.id, label: u.fullName || u.username })),
      },
      {
        key: 'serviceGroup',
        label: 'Nhóm dịch vụ',
        type: 'select',
        options: CRM_SERVICE_GROUPS,
      },
      {
        key: 'billingProvince',
        label: 'Tỉnh/TP (Hóa đơn)',
        type: 'select',
        options: CRM_PROVINCES,
      },
      {
        key: 'from',
        toKey: 'to',
        label: 'Ngày tạo',
        type: 'dateRange',
      },
    ],
    [staffList]
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === rows.length) setSelectedIds([]);
    else setSelectedIds(rows.map((r) => r.id));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: 'Xóa Khách hàng đã chọn',
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} khách hàng đã chọn?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await Promise.all(selectedIds.map((id) => crmEnterpriseApi.deleteAccount(id)));
      toast.success(`Đã xóa ${selectedIds.length} khách hàng`);
      loadData();
    } catch {
      toast.error('Không thể xóa khách hàng đã chọn');
    }
  };

  const handleDeleteSingle = async (row: CrmAccountDto) => {
    const ok = await confirm({
      title: 'Xóa Khách hàng',
      message: `Xóa khách hàng "${row.customerName}" (${row.code})?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await crmEnterpriseApi.deleteAccount(row.id);
      toast.success('Đã xóa khách hàng');
      loadData();
    } catch {
      toast.error('Không thể xóa khách hàng');
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv(
      'danh-sach-khach-hang.csv',
      [
        { header: 'Mã KH', accessor: (r) => r.code },
        { header: 'Tên khách hàng', accessor: (r) => r.customerName },
        { header: 'Điện thoại', accessor: (r) => r.phone },
        { header: 'Mã số thuế', accessor: (r) => r.taxCode },
        { header: 'Trạng thái khách hàng', accessor: (r) => r.customerStatus },
        { header: 'Nhóm dịch vụ', accessor: (r) => r.serviceGroups },
        { header: 'Người phụ trách', accessor: (r) => r.assignedUserName },
        { header: 'Tỉnh/TP (Hóa đơn)', accessor: (r) => r.billingProvince },
        { header: 'Ngày tạo', accessor: (r) => formatDateVi(r.createdAt) },
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
          <h1 className="text-lg font-semibold text-brand-ink">Tất cả Khách hàng</h1>
          <select
            aria-label="Chế độ lọc nhanh Khách hàng"
            value={activePreset}
            onChange={(e) => {
              setActivePreset(e.target.value);
              setPage(0);
            }}
            className="h-8 rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <option value="">Tất cả khách hàng</option>
            {ACCOUNT_SAVED_PRESETS.map((p) => (
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
            to={`${CRM_BASE}/account/new`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Thêm</span>
          </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-brand-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line px-3 py-2">
            <div className="flex flex-1 items-center gap-2">
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
                  placeholder="Tìm mã KH, tên công ty, SĐT, MST, người liên hệ..."
                  aria-label="Tìm kiếm Khách hàng"
                  className="h-8 w-full rounded-md border border-brand-line bg-brand-surface pl-8 pr-3 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-[#ffe4e6]/60 px-2.5 py-1 text-xs">
                  <span className="font-semibold tabular-nums text-[#9f1239]">
                    Đã chọn {selectedIds.length}
                  </span>
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
                aria-label="Tải lại danh sách Khách hàng"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <RefreshCw size={14} aria-hidden="true" />
              </button>

              <CrmColumnPicker
                columns={ACCOUNT_COLUMNS}
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

          {/* 12-column Table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="min-w-[1560px] w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 z-20 border-b border-brand-line bg-brand-surface text-brand-ink">
                <tr>
                  <th className="sticky left-0 z-30 w-10 border-r border-brand-line bg-brand-surface px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selectedIds.length === rows.length}
                      onChange={toggleSelectAll}
                      aria-label="Chọn tất cả Khách hàng trên trang"
                      className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                    />
                  </th>
                  {isColVisible('createdAt') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Ngày tạo</th>
                  )}
                  {isColVisible('customerStatus') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                      Trạng thái khách hàng
                    </th>
                  )}
                  {isColVisible('serviceGroups') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Nhóm dịch vụ</th>
                  )}
                  {isColVisible('demandDetail') && (
                    <th className="min-w-[220px] px-3 py-2.5 font-bold">Chi tiết nhu cầu KH</th>
                  )}
                  {isColVisible('assignedUserName') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Người phụ trách</th>
                  )}
                  {isColVisible('customerName') && (
                    <th className="min-w-[210px] px-3 py-2.5 font-bold">Tên khách hàng</th>
                  )}
                  {isColVisible('relatedUsers') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Người liên quan</th>
                  )}
                  {isColVisible('phone') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Điện thoại</th>
                  )}
                  {isColVisible('servicesSummary') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Dịch vụ</th>
                  )}
                  {isColVisible('careStatuses') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                      Tình trạng chăm sóc KH
                    </th>
                  )}
                  {isColVisible('ownerUserName') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Chủ sở hữu</th>
                  )}
                  {isColVisible('billingProvince') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                      Tỉnh/Thành phố (Hóa đơn)
                    </th>
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
                      <td colSpan={14} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-brand-surface" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-14 text-center">
                      <p className="text-sm font-semibold text-brand-ink">
                        Chưa có Khách hàng phù hợp điều kiện tìm kiếm
                      </p>
                      <p className="mt-1 text-xs text-brand-muted">
                        Tạo mới khách hàng hoặc chuyển đổi từ phân hệ KH Liên hệ để quản lý 360°.
                      </p>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const isSelected = selectedIds.includes(row.id);
                    const isCurrent = activeAccount?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setActiveAccount(row)}
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
                            onChange={() => toggleSelectRow(row.id)}
                            aria-label={`Chọn khách hàng ${row.customerName}`}
                            className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                          />
                        </td>

                        {isColVisible('createdAt') && (
                          <td className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-muted">
                            {formatDateVi(row.createdAt)}
                          </td>
                        )}

                        {isColVisible('customerStatus') && (
                          <td className="px-3 py-2">
                            <CrmStatusBadge status={row.customerStatus} />
                          </td>
                        )}

                        {isColVisible('serviceGroups') && (
                          <td className="max-w-[180px] truncate px-3 py-2 text-brand-ink">
                            {row.serviceGroups?.length ? row.serviceGroups.join(', ') : '—'}
                          </td>
                        )}

                        {isColVisible('demandDetail') && (
                          <td className="max-w-[240px] truncate px-3 py-2 text-brand-ink">
                            {row.demandDetail || '—'}
                          </td>
                        )}

                        {isColVisible('assignedUserName') && (
                          <td className="px-3 py-2">
                            <CrmAssigneePill name={row.assignedUserName} />
                          </td>
                        )}

                        {isColVisible('customerName') && (
                          <td className="px-3 py-2">
                            <Link
                              to={`${CRM_BASE}/account/${row.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-brand-primary hover:underline"
                            >
                              {row.customerName}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] tabular-nums text-brand-muted">
                              <span>{row.code}</span>
                              {row.taxCode && <span>· MST: {row.taxCode}</span>}
                            </div>
                          </td>
                        )}

                        {isColVisible('relatedUsers') && (
                          <td className="max-w-[160px] truncate px-3 py-2 text-brand-muted">
                            {row.relatedUsers?.length ? row.relatedUsers.join(', ') : '—'}
                          </td>
                        )}

                        {isColVisible('phone') && (
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="whitespace-nowrap px-3 py-2 tabular-nums"
                          >
                            {row.phone ? (
                              <a
                                href={`tel:${row.phone}`}
                                className="inline-flex items-center gap-1.5 font-medium text-brand-ink hover:text-brand-primary"
                              >
                                <Phone
                                  size={13}
                                  className="text-brand-primary"
                                  aria-hidden="true"
                                />
                                <span>{row.phone}</span>
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                        )}

                        {isColVisible('servicesSummary') && (
                          <td className="max-w-[180px] truncate px-3 py-2 text-brand-ink">
                            {row.servicesSummary || '—'}
                          </td>
                        )}

                        {isColVisible('careStatuses') && (
                          <td className="px-3 py-2">
                            {row.careStatuses?.length ? (
                              <CrmStatusBadge status={row.careStatuses[0]} />
                            ) : (
                              <span className="text-brand-muted">—</span>
                            )}
                          </td>
                        )}

                        {isColVisible('ownerUserName') && (
                          <td className="whitespace-nowrap px-3 py-2 text-brand-muted">
                            {row.ownerUserName || '—'}
                          </td>
                        )}

                        {isColVisible('billingProvince') && (
                          <td className="whitespace-nowrap px-3 py-2 text-brand-ink">
                            {row.billingProvince || '—'}
                          </td>
                        )}

                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="sticky right-0 z-10 border-l border-brand-line bg-inherit px-2 py-2"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              to={`${CRM_BASE}/sale-order/new?accountId=${row.id}`}
                              aria-label={`Sinh hợp đồng cho ${row.customerName}`}
                              title="Sinh hợp đồng"
                              className="rounded p-1 text-brand-primary hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <FilePlus2 size={14} aria-hidden="true" />
                            </Link>
                            <Link
                              to={`${CRM_BASE}/account/${row.id}/edit`}
                              aria-label={`Sửa khách hàng ${row.customerName}`}
                              title="Sửa"
                              className="rounded p-1 text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(row)}
                              aria-label={`Xóa khách hàng ${row.customerName}`}
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

          <CrmPaginationFooter
            totalElements={meta?.totalElements ?? rows.length}
            page={page}
            pageSize={pageSize}
            totalPages={meta?.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(0);
            }}
          />
        </div>

        {showActivity && (
          <CrmQuickActivityPanel
            docked
            entityType="ACCOUNT"
            entityId={activeAccount?.id}
            entityLabel={activeAccount?.customerName}
            entityPhone={activeAccount?.phone}
            onClose={() => setShowActivity(false)}
          />
        )}

        <CrmFilterPanel
          open={showFilter}
          onClose={() => setShowFilter(false)}
          presets={ACCOUNT_SAVED_PRESETS}
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
        title="Nhập danh sách Khách hàng từ Excel / CSV"
        sampleCsvHeader="Tên khách hàng,Điện thoại,Mã số thuế,Email,Trạng thái khách hàng,Chi tiết nhu cầu KH,Tỉnh/Thành phố (Hóa đơn)"
        sampleCsvRow="Công ty Cổ phần Sao Việt,0912345678,0108889999,phapche@saoviet.vn,Tiềm năng,Tư vấn thường xuyên và đăng ký bản quyền phần mềm,Hà Nội"
        mappings={ACCOUNT_IMPORT_MAPPINGS}
        onClose={() => setShowImport(false)}
        onImport={(items) => crmEnterpriseApi.importAccounts(items)}
        onSuccess={loadData}
      />
    </div>
  );
}
