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
  Settings,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'react-toastify';
import useConfirm from '../../component/common/ui/useConfirm';
import crmEnterpriseApi from '../../features/crm/api';
import CrmColumnPicker, { type CrmColumnOption } from '../../features/crm/CrmColumnPicker';
import CrmConvertLeadModal from '../../features/crm/CrmConvertLeadModal';
import CrmFilterPanel from '../../features/crm/CrmFilterPanel';
import CrmImportModal, { type CrmImportFieldMapping } from '../../features/crm/CrmImportModal';
import CrmMoreActionsMenu, {
  type CrmActionRecordSummary,
} from '../../features/crm/CrmMoreActionsMenu';
import CrmPaginationFooter from '../../features/crm/CrmPaginationFooter';
import CrmQuickActivityPanel from '../../features/crm/CrmQuickActivityPanel';
import CrmQuickEditBar, { buildQuickStatsGroups } from '../../features/crm/CrmQuickEditBar';
import CrmStatusBadge, { CrmAssigneePill, CrmTagList } from '../../features/crm/CrmStatusBadge';
import CrmViewDesignerModal from '../../features/crm/CrmViewDesignerModal';
import CrmViewModeDropdown, { type CrmViewMode } from '../../features/crm/CrmViewModeDropdown';
import CrmViewSelector from '../../features/crm/CrmViewSelector';
import {
  CRM_LEAD_SOURCES,
  CRM_PROVINCES,
  LEAD_CUSTOMER_STATUSES,
  LEAD_SAVED_PRESETS,
} from '../../features/crm/constants';
import { buildLeadFilterFields, extractAssigneeOptions } from '../../features/crm/filterConfigs';
import { exportRowsToCsv, formatDateVi } from '../../features/crm/formatters';
import type {
  CrmFilterRule,
  CrmLeadDto,
  CrmLeadWritePayload,
  PageMeta,
} from '../../features/crm/types';
import {
  LEAD_ALL_COLUMNS,
  LEAD_DEFAULT_COLUMN_KEYS,
  LEAD_SORT_FIELDS,
  LEAD_SYSTEM_VIEWS,
  useCrmSavedViews,
} from '../../features/crm/viewConfigs';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

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

const EMPTY_SUMMARY_KEYS: string[] = [];

export default function LeadListPage() {
  const navigate = useNavigate();
  const { me, staffList } = useCrmWorkspace();
  const { confirm, confirmDialog } = useConfirm();

  const {
    views,
    activeView,
    setActiveViewId,
    pinnedViewId,
    setPinnedViewId,
    toggleFavoriteView,
    saveView,
    deleteView,
    toggleColumnOnActiveView,
    resetActiveViewToDefault,
  } = useCrmSavedViews(
    'luatpoip.crm.lead',
    LEAD_SYSTEM_VIEWS,
    LEAD_ALL_COLUMNS,
    LEAD_DEFAULT_COLUMN_KEYS,
    EMPTY_SUMMARY_KEYS,
    'createdAt'
  );

  const [viewMode, setViewMode] = useState<CrmViewMode>('list');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const [rows, setRows] = useState<CrmLeadDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterRules, setFilterRules] = useState<CrmFilterRule[]>([]);
  const [activePreset, setActivePreset] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeLead, setActiveLead] = useState<CrmLeadDto | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [convertTarget, setConvertTarget] = useState<CrmLeadDto | null>(null);
  const [designerState, setDesignerState] = useState<{
    open: boolean;
    mode: 'edit' | 'create';
  }>({ open: false, mode: 'edit' });

  // Quick-Edit state
  const [dirtyMap, setDirtyMap] = useState<Record<string, CrmLeadWritePayload>>({});
  const [savingQuickEdit, setSavingQuickEdit] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(0);
    }, 250);
    return () => clearTimeout(t);
  }, [keyword]);

  const combinedFilters = useMemo<CrmFilterRule[]>(() => {
    const merged: CrmFilterRule[] = [];
    if (activeView.rules?.length) {
      merged.push(...activeView.rules);
    }
    if (activeView.onlyMine && me?.fullName) {
      merged.push({ field: 'assignedUserName', op: 'EQ', value: me.fullName });
    }
    if (filterRules.length > 0) {
      merged.push(...filterRules);
    }
    return merged;
  }, [activeView, me, filterRules]);

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

      const effectiveSize = viewMode === 'kanban' ? Math.max(pageSize, 100) : pageSize;
      const effectivePage = viewMode === 'kanban' ? 0 : page;

      const res = await crmEnterpriseApi.listLeads({
        keyword: debouncedKeyword || undefined,
        customerStatus: presetStatus,
        filters: combinedFilters.length > 0 ? combinedFilters : undefined,
        sort: `${activeView.sortField},${activeView.sortDir}`,
        page: effectivePage,
        size: effectiveSize,
      });
      setRows(res.rows);
      setMeta(res.meta);
      setSelectedIds([]);
      setDirtyMap({});
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
  }, [
    viewMode,
    debouncedKeyword,
    activePreset,
    combinedFilters,
    activeView.sortField,
    activeView.sortDir,
    page,
    pageSize,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assigneeOptions = useMemo(
    () =>
      extractAssigneeOptions(
        staffList,
        rows.map((r) => r.assignedUserName)
      ),
    [staffList, rows]
  );

  const filterFields = useMemo(() => buildLeadFilterFields(assigneeOptions), [assigneeOptions]);

  const activeColumns = useMemo<CrmColumnOption[]>(() => {
    const resolved = activeView.columns
      .map((key) => LEAD_ALL_COLUMNS.find((c) => c.key === key))
      .filter((c): c is CrmColumnOption => Boolean(c));
    return resolved.length > 0 ? resolved : LEAD_ALL_COLUMNS.slice(0, 12);
  }, [activeView.columns]);

  const quickStats = useMemo(
    () =>
      buildQuickStatsGroups(rows, {
        statusLabel: 'Theo Trạng thái KH Liên hệ',
        getStatus: (r) => r.customerStatus,
        getAssignee: (r) => r.assignedUserName,
        getSource: (r) => r.leadSource,
      }),
    [rows]
  );

  const setDirtyField = <K extends keyof CrmLeadWritePayload>(
    row: CrmLeadDto,
    key: K,
    value: CrmLeadWritePayload[K]
  ) => {
    setDirtyMap((prev) => {
      const existing = prev[row.id] ?? {};
      const nextPatch: CrmLeadWritePayload = {
        ...existing,
        [key]: value,
      };
      if (key === 'fullName') {
        nextPatch.customerName = String(value || '');
      }
      if (key === 'assignedUserName') {
        const matched = staffList.find((u) => (u.fullName || u.username) === String(value || ''));
        nextPatch.assignedUserId = matched ? matched.id : row.assignedUserId;
      }
      return {
        ...prev,
        [row.id]: nextPatch,
      };
    });
  };

  const dirtyIds = Object.keys(dirtyMap);

  const handleSaveQuickEdit = async () => {
    if (dirtyIds.length === 0) return;
    setSavingQuickEdit(true);
    try {
      await Promise.all(
        dirtyIds.map((id) => {
          const original = rows.find((r) => r.id === id);
          const patch = dirtyMap[id];
          if (!original || !patch) return Promise.resolve();
          return crmEnterpriseApi.updateLead(id, {
            ...original,
            ...patch,
          });
        })
      );
      toast.success(`Đã cập nhật nhanh ${dirtyIds.length} KH Liên hệ`);
      setDirtyMap({});
      await loadData();
    } catch {
      toast.error('Không thể lưu một số thay đổi trên KH Liên hệ');
    } finally {
      setSavingQuickEdit(false);
    }
  };

  const handleMoveLeadStatus = async (lead: CrmLeadDto, nextStatus: string) => {
    if (lead.customerStatus === nextStatus) return;
    try {
      await crmEnterpriseApi.updateLead(lead.id, {
        ...lead,
        customerStatus: nextStatus,
      });
      toast.success(`Đã chuyển sang "${nextStatus}"`);
      loadData();
    } catch {
      toast.error('Không thể cập nhật trạng thái KH Liên hệ');
    }
  };

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

  const kanbanColumns = useMemo(
    () =>
      LEAD_CUSTOMER_STATUSES.map((status) => {
        const colItems = rows.filter((r) => r.customerStatus === status);
        return {
          status,
          count: colItems.length,
          items: colItems,
        };
      }),
    [rows]
  );

  const actionSummaries = useMemo<CrmActionRecordSummary[]>(
    () =>
      rows.map((r) => ({
        id: r.id,
        code: r.code,
        title: r.fullName || r.customerName,
        subtitle: r.organizationName || r.phone,
        status: r.customerStatus,
        assignedUserName: r.assignedUserName,
        updatedAt: r.updatedAt || r.createdAt,
      })),
    [rows]
  );

  const fetchDeletedLeads = useCallback(async (): Promise<CrmActionRecordSummary[]> => {
    const res = await crmEnterpriseApi.listLeads({ deleted: true, page: 0, size: 100 });
    return res.rows.map((r) => ({
      id: r.id,
      code: r.code,
      title: r.fullName || r.customerName,
      subtitle: r.organizationName || r.phone,
      status: r.customerStatus,
      assignedUserName: r.assignedUserName,
      updatedAt: r.updatedAt || r.createdAt,
    }));
  }, []);

  const renderCell = (row: CrmLeadDto, colKey: string) => {
    const patch = dirtyMap[row.id] ?? {};
    const isQuickEdit = viewMode === 'quickEdit';

    switch (colKey) {
      case 'tags':
        return (
          <td key={colKey} className="px-3 py-2">
            <CrmTagList tags={row.tags} />
          </td>
        );

      case 'createdAt':
      case 'birthDate':
      case 'lastInteractedAt':
        return (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-muted">
            {formatDateVi(row[colKey])}
          </td>
        );

      case 'customerStatus':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <select
              aria-label={`Trạng thái KH Liên hệ ${row.fullName || row.code}`}
              value={patch.customerStatus ?? row.customerStatus}
              onChange={(e) => setDirtyField(row, 'customerStatus', e.target.value)}
              className="h-7 rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              {LEAD_CUSTOMER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </td>
        ) : (
          <td key={colKey} className="px-3 py-2">
            <CrmStatusBadge status={row.customerStatus} />
          </td>
        );

      case 'assignedUserName': {
        const curAssignee =
          patch.assignedUserName !== undefined
            ? (patch.assignedUserName ?? '')
            : (row.assignedUserName ?? '');
        const selectOpts = Array.from(new Set([curAssignee, ...assigneeOptions].filter(Boolean)));
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <select
              aria-label={`Người phụ trách ${row.fullName || row.code}`}
              value={curAssignee}
              onChange={(e) => setDirtyField(row, 'assignedUserName', e.target.value)}
              className="h-7 min-w-[140px] rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <option value="">-- Chưa phân công --</option>
              {selectOpts.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </td>
        ) : (
          <td key={colKey} className="px-3 py-2">
            <CrmAssigneePill name={row.assignedUserName} />
          </td>
        );
      }

      case 'fullName':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="text"
              aria-label={`Họ và tên ${row.code}`}
              value={
                patch.fullName !== undefined
                  ? patch.fullName
                  : row.fullName || row.customerName || ''
              }
              onChange={(e) => setDirtyField(row, 'fullName', e.target.value)}
              className="h-7 w-full min-w-[160px] rounded border border-brand-line bg-white px-2 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="px-3 py-2">
            <Link
              to={`${CRM_BASE}/lead/${row.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-brand-primary hover:underline"
            >
              {row.fullName || row.customerName}
            </Link>
            <div className="text-[11px] tabular-nums text-brand-muted">{row.code}</div>
          </td>
        );

      case 'phone':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="text"
              aria-label={`Điện thoại ${row.code}`}
              value={patch.phone !== undefined ? patch.phone : row.phone || ''}
              onChange={(e) => setDirtyField(row, 'phone', e.target.value)}
              className="h-7 w-[124px] rounded border border-brand-line bg-white px-2 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td
            key={colKey}
            onClick={(e) => e.stopPropagation()}
            className="whitespace-nowrap px-3 py-2 tabular-nums"
          >
            {row.phone ? (
              <a
                href={`tel:${row.phone}`}
                className="inline-flex items-center gap-1.5 font-medium text-brand-ink hover:text-brand-primary"
              >
                <Phone size={13} className="text-brand-primary" aria-hidden="true" />
                <span>{row.phone}</span>
              </a>
            ) : (
              <span className="text-brand-muted">—</span>
            )}
          </td>
        );

      case 'serviceGroups':
        return (
          <td key={colKey} className="max-w-[200px] truncate px-3 py-2 text-brand-ink">
            {row.serviceGroups?.length ? row.serviceGroups.join(', ') : '—'}
          </td>
        );

      case 'demandDetail':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="text"
              aria-label={`Chi tiết nhu cầu KH ${row.code}`}
              value={
                patch.demandDetail !== undefined
                  ? (patch.demandDetail ?? '')
                  : (row.demandDetail ?? '')
              }
              onChange={(e) => setDirtyField(row, 'demandDetail', e.target.value)}
              className="h-7 w-full min-w-[180px] rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="max-w-[260px] truncate px-3 py-2 text-brand-ink">
            {row.demandDetail || '—'}
          </td>
        );

      case 'organizationName':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="text"
              aria-label={`Tổ chức ${row.code}`}
              value={
                patch.organizationName !== undefined
                  ? (patch.organizationName ?? '')
                  : (row.organizationName ?? '')
              }
              onChange={(e) => setDirtyField(row, 'organizationName', e.target.value)}
              className="h-7 w-full min-w-[160px] rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="max-w-[180px] truncate px-3 py-2 text-brand-ink">
            {row.organizationName || '—'}
          </td>
        );

      case 'province':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <select
              aria-label={`Tỉnh/Thành phố ${row.code}`}
              value={patch.province !== undefined ? (patch.province ?? '') : (row.province ?? '')}
              onChange={(e) => setDirtyField(row, 'province', e.target.value)}
              className="h-7 rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <option value="">-- Chọn tỉnh/TP --</option>
              {CRM_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </td>
        ) : (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 text-brand-ink">
            {row.province || '—'}
          </td>
        );

      case 'leadSource':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <select
              aria-label={`Nguồn gốc KH ${row.code}`}
              value={
                patch.leadSource !== undefined ? (patch.leadSource ?? '') : (row.leadSource ?? '')
              }
              onChange={(e) => setDirtyField(row, 'leadSource', e.target.value)}
              className="h-7 rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <option value="">-- Chọn nguồn --</option>
              {CRM_LEAD_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </td>
        ) : (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 text-brand-muted">
            {row.leadSource || '—'}
          </td>
        );

      case 'shared':
        return (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 text-brand-muted">
            {row.shared ? 'Có' : 'Không'}
          </td>
        );

      default: {
        const val = (row as unknown as Record<string, unknown>)[colKey];
        return (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 text-brand-ink">
            {val ? String(val) : '—'}
          </td>
        );
      }
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden px-3 pb-3 pt-2.5 sm:px-4">
      {confirmDialog}

      {/* Sub-header */}
      <div className="mb-2.5 flex min-h-[44px] flex-wrap items-center justify-between gap-2">
        <CrmViewSelector
          views={views}
          activeView={activeView}
          pinnedViewId={pinnedViewId}
          onSelectView={(v) => {
            setActiveViewId(v.id);
            setPage(0);
          }}
          onToggleFavorite={toggleFavoriteView}
          onPinView={setPinnedViewId}
          onEditView={() => setDesignerState({ open: true, mode: 'edit' })}
          onCreateView={() => setDesignerState({ open: true, mode: 'create' })}
        />

        <div className="flex flex-wrap items-center gap-2">
          <CrmViewModeDropdown
            value={viewMode}
            onChange={(nextMode) => {
              setViewMode(nextMode);
              if (nextMode !== 'quickEdit') setDirtyMap({});
            }}
            ariaLabel="Chuyển chế độ xem KH Liên hệ"
          />

          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Upload size={14} className="text-brand-primary" aria-hidden="true" />
            <span>Nhập từ Excel</span>
          </button>

          {viewMode !== 'kanban' && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-3 text-xs font-medium text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Download size={14} className="text-brand-muted" aria-hidden="true" />
              <span className="hidden sm:inline">Xuất CSV</span>
            </button>
          )}

          <Link
            to={`${CRM_BASE}/lead/new`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Thêm</span>
          </Link>

          <CrmMoreActionsMenu
            moduleEndpoint="leads"
            moduleLabel="KH Liên hệ"
            records={actionSummaries}
            selectedIds={selectedIds}
            staffList={staffList}
            quickStats={quickStats}
            fetchDeletedRecords={fetchDeletedLeads}
            onReload={loadData}
          />
        </div>
      </div>

      {/* Content Area: Table/Kanban Card + Right Docked Panels */}
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

              {viewMode !== 'kanban' && (
                <>
                  <button
                    type="button"
                    onClick={() => setDesignerState({ open: true, mode: 'edit' })}
                    aria-label="Thiết lập giao diện bảng KH Liên hệ"
                    title="Sửa giao diện"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-muted hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <Settings size={14} aria-hidden="true" />
                  </button>

                  <CrmColumnPicker
                    columns={LEAD_ALL_COLUMNS}
                    visibleKeys={activeView.columns}
                    onToggle={toggleColumnOnActiveView}
                    onReset={resetActiveViewToDefault}
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
                </>
              )}

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

          {viewMode === 'quickEdit' && (
            <CrmQuickEditBar
              dirtyCount={dirtyIds.length}
              saving={savingQuickEdit}
              onCancel={() => {
                if (dirtyIds.length > 0) setDirtyMap({});
                else setViewMode('list');
              }}
              onSave={handleSaveQuickEdit}
            />
          )}

          {viewMode === 'kanban' ? (
            <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto bg-brand-surface/50 p-3">
              {kanbanColumns.map((col) => (
                <div
                  key={col.status}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedLeadId) {
                      const found = rows.find((r) => r.id === draggedLeadId);
                      if (found) {
                        handleMoveLeadStatus(found, col.status);
                      }
                      setDraggedLeadId(null);
                    }
                  }}
                  className="flex h-full w-[280px] shrink-0 flex-col rounded-lg border border-brand-line bg-white"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-brand-line bg-brand-surface px-3 py-2.5">
                    <h2 className="truncate text-xs font-bold text-brand-ink">{col.status}</h2>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold tabular-nums text-brand-primary">
                      {col.count}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
                    {col.items.length === 0 ? (
                      <div className="rounded-md border border-dashed border-brand-line p-4 text-center text-[11px] text-brand-muted">
                        Kéo thả KH Liên hệ vào cột này
                      </div>
                    ) : (
                      col.items.map((item) => (
                        <article
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedLeadId(item.id)}
                          onDragEnd={() => setDraggedLeadId(null)}
                          className="space-y-2 rounded-lg border border-brand-line bg-white p-3 transition-shadow hover:shadow-card"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`${CRM_BASE}/lead/${item.id}`}
                              className="text-xs font-semibold text-brand-primary hover:underline"
                            >
                              {item.fullName || item.customerName}
                            </Link>
                            <span className="shrink-0 text-[10px] tabular-nums text-brand-muted">
                              {item.code}
                            </span>
                          </div>

                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium tabular-nums text-brand-ink hover:text-brand-primary"
                            >
                              <Phone size={12} className="text-brand-primary" aria-hidden="true" />
                              <span>{item.phone}</span>
                            </a>
                          )}

                          {item.organizationName && (
                            <div className="truncate text-[11px] text-brand-ink">
                              {item.organizationName}
                            </div>
                          )}

                          {item.serviceGroups?.length > 0 && (
                            <div className="truncate text-[11px] text-brand-muted">
                              {item.serviceGroups.join(', ')}
                            </div>
                          )}

                          {item.assignedUserName && (
                            <div>
                              <CrmAssigneePill name={item.assignedUserName} />
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-1.5 border-t border-brand-line pt-2">
                            <select
                              aria-label={`Chuyển trạng thái cho ${item.fullName || item.code}`}
                              value={item.customerStatus}
                              onChange={(e) => handleMoveLeadStatus(item, e.target.value)}
                              className="min-w-0 flex-1 rounded border border-brand-line bg-brand-surface px-1.5 py-1 text-[11px] text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              {LEAD_CUSTOMER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>

                            {!item.convertedAccountId && (
                              <button
                                type="button"
                                onClick={() => setConvertTarget(item)}
                                aria-label={`Chuyển đổi ${item.fullName || item.code}`}
                                title="Chuyển đổi sang Khách hàng"
                                className="rounded border border-brand-line p-1 text-brand-primary hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                              >
                                <ArrowRightLeft size={13} aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
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
                      {activeColumns.map((col) => (
                        <th
                          key={col.key}
                          className={`whitespace-nowrap px-3 py-2.5 font-bold ${
                            col.key === 'demandDetail' ? 'min-w-[220px]' : ''
                          }`}
                        >
                          {col.label}
                        </th>
                      ))}
                      <th className="sticky right-0 z-30 w-28 border-l border-brand-line bg-brand-surface px-2.5 py-2.5 text-center font-bold">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-brand-line">
                    {loading ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={idx}>
                          <td colSpan={activeColumns.length + 2} className="px-4 py-3">
                            <div className="h-4 w-full animate-pulse rounded bg-brand-surface" />
                          </td>
                        </tr>
                      ))
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={activeColumns.length + 2} className="px-6 py-14 text-center">
                          <p className="text-sm font-semibold text-brand-ink">
                            Chưa có KH Liên hệ phù hợp điều kiện lọc
                          </p>
                          <p className="mt-1 text-xs text-brand-muted">
                            Nhấn nút &ldquo;+ Thêm&rdquo; hoặc &ldquo;Nhập từ Excel&rdquo; để tiếp
                            nhận đầu mối tư vấn pháp lý mới.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => {
                        const isSelected = selectedIds.includes(row.id);
                        const isCurrent = activeLead?.id === row.id;
                        const isDirty = Boolean(dirtyMap[row.id]);
                        return (
                          <tr
                            key={row.id}
                            onClick={() => setActiveLead(row)}
                            className={`group cursor-pointer transition-colors ${
                              isDirty
                                ? 'bg-brand-accentSoft/40'
                                : isSelected || isCurrent
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

                            {activeColumns.map((col) => renderCell(row, col.key))}

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
                onConfigureSummary={() => setDesignerState({ open: true, mode: 'edit' })}
              />
            </>
          )}
        </div>

        {viewMode !== 'kanban' && showActivity && (
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
          rules={filterRules}
          onApplyRules={(nextRules) => {
            setFilterRules(nextRules);
            setPage(0);
          }}
          onReset={() => {
            setFilterRules([]);
            setActivePreset('');
            setPage(0);
          }}
          storageKey="luatpoip.crm.lead.savedFilters"
          quickStats={quickStats}
        />
      </div>

      <CrmViewDesignerModal
        open={designerState.open}
        mode={designerState.mode}
        view={activeView}
        allColumns={LEAD_ALL_COLUMNS}
        defaultColumnKeys={LEAD_DEFAULT_COLUMN_KEYS}
        sortFields={LEAD_SORT_FIELDS}
        defaultSortField="createdAt"
        onClose={() => setDesignerState((prev) => ({ ...prev, open: false }))}
        onSave={saveView}
        onDelete={deleteView}
      />

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
