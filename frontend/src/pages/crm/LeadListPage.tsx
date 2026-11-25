import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRightLeft,
  Download,
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
import CrmConvertLeadModal from '../../features/crm/CrmConvertLeadModal';
import CrmFilterPanel, { type CrmFilterFieldConfig } from '../../features/crm/CrmFilterPanel';
import CrmImportModal, { type CrmImportFieldMapping } from '../../features/crm/CrmImportModal';
import CrmPaginationFooter from '../../features/crm/CrmPaginationFooter';
import CrmQuickActivityPanel from '../../features/crm/CrmQuickActivityPanel';
import CrmStatusBadge, { CrmAssigneePill, CrmTagList } from '../../features/crm/CrmStatusBadge';
import {
  CRM_LEAD_SOURCES,
  CRM_PROVINCES,
  CRM_SERVICE_GROUPS,
  LEAD_CUSTOMER_STATUSES,
  LEAD_SAVED_PRESETS,
} from '../../features/crm/constants';
import { exportRowsToCsv, formatDateVi } from '../../features/crm/formatters';
import type { CrmLeadDto, PageMeta } from '../../features/crm/types';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

const LEAD_COLUMNS: CrmColumnOption[] = [
  { key: 'tags', label: 'Thẻ' },
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'customerStatus', label: 'Trạng thái khách hàng' },
  { key: 'assignedUserName', label: 'Người phụ trách' },
  { key: 'fullName', label: 'Họ và tên', locked: true },
  { key: 'phone', label: 'Điện thoại', locked: true },
  { key: 'serviceGroups', label: 'Nhóm dịch vụ' },
  { key: 'demandDetail', label: 'Chi tiết nhu cầu KH' },
  { key: 'organizationName', label: 'Tổ chức' },
  { key: 'province', label: 'Tỉnh/Thành phố' },
  { key: 'leadSource', label: 'Nguồn gốc KH' },
  { key: 'ownerUserName', label: 'Chủ sở hữu' },
];

const LEAD_IMPORT_MAPPINGS: CrmImportFieldMapping[] = [
  {
    field: 'fullName',
    label: 'Họ và tên',
    aliases: ['Tên khách hàng', 'Họ tên', 'customerName'],
    required: true,
  },
  {
    field: 'phone',
    label: 'Điện thoại',
    aliases: ['SĐT', 'Số điện thoại'],
    required: true,
  },
  {
    field: 'personalEmail',
    label: 'Email cá nhân',
    aliases: ['Email', 'workEmail'],
  },
  {
    field: 'organizationName',
    label: 'Tổ chức',
    aliases: ['Công ty', 'Tên công ty'],
  },
  {
    field: 'customerStatus',
    label: 'Trạng thái khách hàng',
    aliases: ['Trạng thái'],
  },
  {
    field: 'leadSource',
    label: 'Nguồn gốc KH',
    aliases: ['Nguồn'],
  },
  {
    field: 'demandDetail',
    label: 'Chi tiết nhu cầu KH',
    aliases: ['Nhu cầu', 'Ghi chú'],
  },
  {
    field: 'province',
    label: 'Tỉnh/Thành phố',
    aliases: ['Tỉnh thành'],
  },
];

export default function LeadListPage() {
  const navigate = useNavigate();
  const { staffList } = useCrmWorkspace();
  const { confirm, confirmDialog } = useConfirm();

  const [rows, setRows] = useState<CrmLeadDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [activePreset, setActivePreset] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeLead, setActiveLead] = useState<CrmLeadDto | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [convertTarget, setConvertTarget] = useState<CrmLeadDto | null>(null);

  const { visibleKeys, toggleColumn, resetColumns } = usePersistedColumns(
    'luatpoip.crm.lead.columns',
    LEAD_COLUMNS
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
        activePreset === 'HIGH_DEMAND'
          ? '2/ Nhu cầu cao'
          : activePreset === 'POTENTIAL'
            ? '3/ Tiềm năng'
            : activePreset === 'CONVERTED'
              ? '1/ Chốt hợp đồng'
              : activePreset === 'FOLLOW_UP'
                ? '4/ Tiếp tục chăm sóc'
                : undefined;

      const res = await crmEnterpriseApi.listLeads({
        keyword: debouncedKeyword || undefined,
        customerStatus: filterValues.customerStatus || presetStatus,
        leadSource: filterValues.leadSource || undefined,
        assignedTo: filterValues.assignedTo || undefined,
        serviceGroup: filterValues.serviceGroup || undefined,
        province: filterValues.province || undefined,
        from: filterValues.from || undefined,
        to: filterValues.to || undefined,
        page,
        size: pageSize,
      });
      setRows(res.rows);
      setMeta(res.meta);
      setSelectedIds([]);
      setActiveLead((prev) =>
        prev
          ? (res.rows.find((r) => r.id === prev.id) ?? res.rows[0] ?? null)
          : (res.rows[0] ?? null)
      );
    } catch {
      toast.error('Không tải được danh sách KH Liên hệ');
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
        options: LEAD_CUSTOMER_STATUSES,
      },
      {
        key: 'leadSource',
        label: 'Nguồn gốc KH',
        type: 'select',
        options: CRM_LEAD_SOURCES,
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
        key: 'province',
        label: 'Tỉnh/Thành phố',
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
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: 'Xóa KH Liên hệ đã chọn',
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} KH Liên hệ đã chọn?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await Promise.all(selectedIds.map((id) => crmEnterpriseApi.deleteLead(id)));
      toast.success(`Đã xóa ${selectedIds.length} KH Liên hệ`);
      loadData();
    } catch {
      toast.error('Không thể xóa một số bản ghi đã chọn');
    }
  };

  const handleDeleteSingle = async (row: CrmLeadDto) => {
    const ok = await confirm({
      title: 'Xóa KH Liên hệ',
      message: `Xóa KH Liên hệ "${row.fullName || row.customerName}" (${row.code})?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await crmEnterpriseApi.deleteLead(row.id);
      toast.success('Đã xóa KH Liên hệ');
      loadData();
    } catch {
      toast.error('Không thể xóa KH Liên hệ');
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv(
      'danh-sach-kh-lien-he.csv',
      [
        { header: 'Mã TN', accessor: (r) => r.code },
        { header: 'Họ và tên', accessor: (r) => r.fullName },
        { header: 'Điện thoại', accessor: (r) => r.phone },
        { header: 'Trạng thái KH', accessor: (r) => r.customerStatus },
        { header: 'Người phụ trách', accessor: (r) => r.assignedUserName },
        { header: 'Nhóm dịch vụ', accessor: (r) => r.serviceGroups },
        { header: 'Chi tiết nhu cầu KH', accessor: (r) => r.demandDetail },
        { header: 'Tổ chức', accessor: (r) => r.organizationName },
        { header: 'Tỉnh/Thành phố', accessor: (r) => r.province },
        { header: 'Nguồn gốc KH', accessor: (r) => r.leadSource },
        { header: 'Ngày tạo', accessor: (r) => formatDateVi(r.createdAt) },
      ],
      rows
    );
  };

  const isColVisible = (key: string) => visibleKeys.includes(key);

  return (
    <div className="flex h-full flex-col overflow-hidden px-3 pb-3 pt-2.5 sm:px-4">
      {confirmDialog}

      {/* Sub-header (56px) */}
      <div className="mb-2.5 flex min-h-[44px] flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-lg font-semibold text-brand-ink">Tất cả KH Liên hệ</h1>
          <select
            aria-label="Chế độ lọc nhanh KH Liên hệ"
            value={activePreset}
            onChange={(e) => {
              setActivePreset(e.target.value);
              setPage(0);
            }}
            className="h-8 rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <option value="">Tất cả bản ghi</option>
            {LEAD_SAVED_PRESETS.map((p) => (
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
            to={`${CRM_BASE}/lead/new`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Thêm</span>
          </Link>
        </div>
      </div>

      {/* Content Area: Table Card + Right Docked Panels */}
      <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-brand-line bg-white">
          {/* Table Toolbar */}
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
                  placeholder="Tìm mã TN, họ tên, SĐT, tổ chức, nhu cầu..."
                  aria-label="Tìm kiếm KH Liên hệ"
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
                aria-label="Tải lại danh sách KH Liên hệ"
                title="Tải lại"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <RefreshCw size={14} aria-hidden="true" />
              </button>

              <CrmColumnPicker
                columns={LEAD_COLUMNS}
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

          {/* Scrollable Dense Table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="min-w-[1480px] w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 z-20 border-b border-brand-line bg-brand-surface text-brand-ink">
                <tr>
                  <th className="sticky left-0 z-30 w-10 border-r border-brand-line bg-brand-surface px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selectedIds.length === rows.length}
                      onChange={toggleSelectAll}
                      aria-label="Chọn tất cả KH Liên hệ trên trang"
                      className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                    />
                  </th>
                  {isColVisible('tags') && <th className="px-3 py-2.5 font-bold">Thẻ</th>}
                  {isColVisible('createdAt') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Ngày tạo</th>
                  )}
                  {isColVisible('customerStatus') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                      Trạng thái khách hàng
                    </th>
                  )}
                  {isColVisible('assignedUserName') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Người phụ trách</th>
                  )}
                  {isColVisible('fullName') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Họ và tên</th>
                  )}
                  {isColVisible('phone') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Điện thoại</th>
                  )}
                  {isColVisible('serviceGroups') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Nhóm dịch vụ</th>
                  )}
                  {isColVisible('demandDetail') && (
                    <th className="min-w-[220px] px-3 py-2.5 font-bold">Chi tiết nhu cầu KH</th>
                  )}
                  {isColVisible('organizationName') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Tổ chức</th>
                  )}
                  {isColVisible('province') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Tỉnh/Thành phố</th>
                  )}
                  {isColVisible('leadSource') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Nguồn gốc KH</th>
                  )}
                  {isColVisible('ownerUserName') && (
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Chủ sở hữu</th>
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
                        Chưa có KH Liên hệ phù hợp điều kiện lọc
                      </p>
                      <p className="mt-1 text-xs text-brand-muted">
                        Nhấn nút &ldquo;+ Thêm&rdquo; hoặc &ldquo;Nhập từ Excel&rdquo; để tiếp nhận
                        đầu mối tư vấn pháp lý mới.
                      </p>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const isSelected = selectedIds.includes(row.id);
                    const isCurrent = activeLead?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setActiveLead(row)}
                        className={`group cursor-pointer transition-colors ${
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
                            aria-label={`Chọn KH Liên hệ ${row.fullName || row.code}`}
                            className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                          />
                        </td>

                        {isColVisible('tags') && (
                          <td className="px-3 py-2">
                            <CrmTagList tags={row.tags} />
                          </td>
                        )}

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

                        {isColVisible('assignedUserName') && (
                          <td className="px-3 py-2">
                            <CrmAssigneePill name={row.assignedUserName} />
                          </td>
                        )}

                        {isColVisible('fullName') && (
                          <td className="px-3 py-2">
                            <Link
                              to={`${CRM_BASE}/lead/${row.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-brand-primary hover:underline"
                            >
                              {row.fullName || row.customerName}
                            </Link>
                            <div className="text-[11px] tabular-nums text-brand-muted">
                              {row.code}
                            </div>
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
                              <span className="text-brand-muted">—</span>
                            )}
                          </td>
                        )}

                        {isColVisible('serviceGroups') && (
                          <td className="max-w-[200px] truncate px-3 py-2 text-brand-ink">
                            {row.serviceGroups?.length ? row.serviceGroups.join(', ') : '—'}
                          </td>
                        )}

                        {isColVisible('demandDetail') && (
                          <td className="max-w-[260px] truncate px-3 py-2 text-brand-ink">
                            {row.demandDetail || '—'}
                          </td>
                        )}

                        {isColVisible('organizationName') && (
                          <td className="max-w-[180px] truncate px-3 py-2 text-brand-ink">
                            {row.organizationName || '—'}
                          </td>
                        )}

                        {isColVisible('province') && (
                          <td className="whitespace-nowrap px-3 py-2 text-brand-ink">
                            {row.province || '—'}
                          </td>
                        )}

                        {isColVisible('leadSource') && (
                          <td className="whitespace-nowrap px-3 py-2 text-brand-muted">
                            {row.leadSource || '—'}
                          </td>
                        )}

                        {isColVisible('ownerUserName') && (
                          <td className="whitespace-nowrap px-3 py-2 text-brand-muted">
                            {row.ownerUserName || '—'}
                          </td>
                        )}

                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="sticky right-0 z-10 border-l border-brand-line bg-inherit px-2 py-2"
                        >
                          <div className="flex items-center justify-center gap-1">
                            {!row.convertedAccountId && (
                              <button
                                type="button"
                                onClick={() => setConvertTarget(row)}
                                aria-label={`Chuyển đổi ${row.fullName || row.code}`}
                                title="Chuyển đổi sang Khách hàng"
                                className="rounded p-1 text-brand-primary hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                              >
                                <ArrowRightLeft size={14} aria-hidden="true" />
                              </button>
                            )}
                            <Link
                              to={`${CRM_BASE}/lead/${row.id}/edit`}
                              aria-label={`Sửa ${row.fullName || row.code}`}
                              title="Sửa"
                              className="rounded p-1 text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(row)}
                              aria-label={`Xóa ${row.fullName || row.code}`}
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
            entityType="LEAD"
            entityId={activeLead?.id}
            entityLabel={activeLead?.fullName || activeLead?.customerName}
            entityPhone={activeLead?.phone}
            onClose={() => setShowActivity(false)}
          />
        )}

        <CrmFilterPanel
          open={showFilter}
          onClose={() => setShowFilter(false)}
          presets={LEAD_SAVED_PRESETS}
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
        title="Nhập danh sách KH Liên hệ từ Excel / CSV"
        sampleCsvHeader="Họ và tên,Điện thoại,Email cá nhân,Tổ chức,Trạng thái khách hàng,Nguồn gốc KH,Chi tiết nhu cầu KH,Tỉnh/Thành phố"
        sampleCsvRow="Nguyễn Thị Minh Anh,0909123456,minhanh@congty.vn,Công ty TNHH Minh Anh,2/ Nhu cầu cao,1/ Quảng cáo,Đăng ký nhãn hiệu độc quyền nhóm 35,Hà Nội"
        mappings={LEAD_IMPORT_MAPPINGS}
        onClose={() => setShowImport(false)}
        onImport={(items) => crmEnterpriseApi.importLeads(items)}
        onSuccess={loadData}
      />

      <CrmConvertLeadModal
        open={Boolean(convertTarget)}
        lead={convertTarget}
        onClose={() => setConvertTarget(null)}
        onConverted={(res) => {
          setConvertTarget(null);
          navigate(`${CRM_BASE}/account/${res.accountId}`);
        }}
      />
    </div>
  );
}
