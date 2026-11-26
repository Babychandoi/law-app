import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Download,
  FileCheck2,
  Filter,
  Pencil,
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
import CrmFilterPanel from '../../features/crm/CrmFilterPanel';
import CrmImportModal, { type CrmImportFieldMapping } from '../../features/crm/CrmImportModal';
import CrmMoreActionsMenu, {
  type CrmActionRecordSummary,
} from '../../features/crm/CrmMoreActionsMenu';
import CrmPaginationFooter, { type CrmFooterKpiItem } from '../../features/crm/CrmPaginationFooter';
import CrmQuickActivityPanel from '../../features/crm/CrmQuickActivityPanel';
import CrmQuickEditBar, { buildQuickStatsGroups } from '../../features/crm/CrmQuickEditBar';
import CrmStatusBadge, { CrmAssigneePill, CrmTagList } from '../../features/crm/CrmStatusBadge';
import CrmViewDesignerModal from '../../features/crm/CrmViewDesignerModal';
import CrmViewModeDropdown, { type CrmViewMode } from '../../features/crm/CrmViewModeDropdown';
import CrmViewSelector from '../../features/crm/CrmViewSelector';
import { OPPORTUNITY_SAVED_PRESETS, OPPORTUNITY_STAGES } from '../../features/crm/constants';
import {
  buildOpportunityFilterFields,
  extractAssigneeOptions,
} from '../../features/crm/filterConfigs';
import {
  exportRowsToCsv,
  formatDateVi,
  formatVnd,
  toDateInputValue,
} from '../../features/crm/formatters';
import type {
  CrmFilterRule,
  CrmKanbanColumnDto,
  CrmOpportunityDto,
  CrmOpportunityWritePayload,
  PageMeta,
} from '../../features/crm/types';
import {
  OPPORTUNITY_ALL_COLUMNS,
  OPPORTUNITY_ALL_SUMMARY_FIELDS,
  OPPORTUNITY_DEFAULT_COLUMN_KEYS,
  OPPORTUNITY_DEFAULT_SUMMARY_KEYS,
  OPPORTUNITY_SORT_FIELDS,
  OPPORTUNITY_SYSTEM_VIEWS,
  useCrmSavedViews,
} from '../../features/crm/viewConfigs';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

const OPPORTUNITY_IMPORT_MAPPINGS: CrmImportFieldMapping[] = [
  {
    field: 'opportunityName',
    label: 'Tên cơ hội',
    aliases: ['Cơ hội'],
    required: true,
  },
  {
    field: 'accountName',
    label: 'Khách hàng',
    aliases: ['Tên khách hàng'],
  },
  {
    field: 'contactName',
    label: 'Liên hệ',
    aliases: ['Người liên hệ'],
  },
  {
    field: 'expectedRevenue',
    label: 'Số tiền',
    aliases: ['Doanh số kỳ vọng', 'Giá trị'],
  },
  {
    field: 'stage',
    label: 'Giai đoạn',
    aliases: ['Bước'],
  },
  {
    field: 'expectedCloseDate',
    label: 'Ngày kỳ vọng/kết thúc',
    aliases: ['Ngày kỳ vọng'],
  },
];

export default function OpportunityListPage() {
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
    'luatpoip.crm.opportunity',
    OPPORTUNITY_SYSTEM_VIEWS,
    OPPORTUNITY_ALL_COLUMNS,
    OPPORTUNITY_DEFAULT_COLUMN_KEYS,
    OPPORTUNITY_DEFAULT_SUMMARY_KEYS,
    'createdAt'
  );

  const [viewMode, setViewMode] = useState<CrmViewMode>('list');
  const [rows, setRows] = useState<CrmOpportunityDto[]>([]);
  const [kanbanColumns, setKanbanColumns] = useState<CrmKanbanColumnDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterRules, setFilterRules] = useState<CrmFilterRule[]>([]);
  const [activePreset, setActivePreset] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeOpp, setActiveOpp] = useState<CrmOpportunityDto | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const [designerState, setDesignerState] = useState<{
    open: boolean;
    mode: 'edit' | 'create';
  }>({ open: false, mode: 'edit' });

  // Quick-Edit state
  const [dirtyMap, setDirtyMap] = useState<Record<string, CrmOpportunityWritePayload>>({});
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
      const presetStage =
        activePreset === 'DRAFT_CONTRACT'
          ? '6/ Gửi HĐ dự thảo cho KH'
          : activePreset === 'FIRST_PAYMENT'
            ? '7/ KH thanh toán lần 1'
            : activePreset === 'QUALIFIED'
              ? '5/ KH đủ điều kiện hồ sơ'
              : undefined;

      if (viewMode === 'kanban') {
        const cols = await crmEnterpriseApi.getOpportunityKanban({
          keyword: debouncedKeyword || undefined,
          stage: presetStage,
          filters: combinedFilters.length > 0 ? combinedFilters : undefined,
        });
        const merged: CrmKanbanColumnDto[] = OPPORTUNITY_STAGES.map((stage) => {
          const found = cols.find((c) => c.stage === stage);
          return (
            found ?? {
              stage,
              count: 0,
              totalExpectedRevenue: 0,
              items: [],
            }
          );
        });
        setKanbanColumns(merged);
      } else {
        const res = await crmEnterpriseApi.listOpportunities({
          keyword: debouncedKeyword || undefined,
          stage: presetStage,
          filters: combinedFilters.length > 0 ? combinedFilters : undefined,
          sort: `${activeView.sortField},${activeView.sortDir}`,
          page,
          size: pageSize,
        });
        setRows(res.rows);
        setMeta(res.meta);
        setSelectedIds([]);
        setDirtyMap({});
        setActiveOpp((prev) =>
          prev
            ? (res.rows.find((r) => r.id === prev.id) ?? res.rows[0] ?? null)
            : (res.rows[0] ?? null)
        );
      }
    } catch {
      toast.error('Không tải được dữ liệu Cơ hội HĐ');
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

  const allLoadedItems = useMemo(
    () => (viewMode === 'kanban' ? kanbanColumns.flatMap((c) => c.items) : rows),
    [viewMode, kanbanColumns, rows]
  );

  const assigneeOptions = useMemo(
    () =>
      extractAssigneeOptions(
        staffList,
        allLoadedItems.map((r) => r.assignedUserName)
      ),
    [staffList, allLoadedItems]
  );

  const filterFields = useMemo(
    () => buildOpportunityFilterFields(assigneeOptions),
    [assigneeOptions]
  );

  const activeColumns = useMemo<CrmColumnOption[]>(() => {
    const resolved = activeView.columns
      .map((key) => OPPORTUNITY_ALL_COLUMNS.find((c) => c.key === key))
      .filter((c): c is CrmColumnOption => Boolean(c));
    return resolved.length > 0 ? resolved : OPPORTUNITY_ALL_COLUMNS.slice(0, 9);
  }, [activeView.columns]);

  const quickStats = useMemo(
    () =>
      buildQuickStatsGroups(allLoadedItems, {
        statusLabel: 'Theo Giai đoạn Cơ hội HĐ',
        getStatus: (r) => r.stage,
        getAssignee: (r) => r.assignedUserName,
        getSource: (r) => r.leadSource,
        getAmount: (r) => r.expectedRevenue,
      }),
    [allLoadedItems]
  );

  const footerKpis = useMemo<CrmFooterKpiItem[]>(() => {
    if (!activeView.summaryKeys.includes('expectedRevenue')) return [];
    const sumExpected = rows.reduce((acc, item) => acc + item.expectedRevenue, 0);
    return [
      {
        label: 'Số tiền kỳ vọng',
        value: formatVnd(sumExpected),
        tone: 'emerald',
      },
    ];
  }, [rows, activeView.summaryKeys]);

  const setDirtyField = <K extends keyof CrmOpportunityWritePayload>(
    row: CrmOpportunityDto,
    key: K,
    value: CrmOpportunityWritePayload[K]
  ) => {
    setDirtyMap((prev) => {
      const existing = prev[row.id] ?? {};
      const nextPatch: CrmOpportunityWritePayload = {
        ...existing,
        [key]: value,
      };
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
          return crmEnterpriseApi.updateOpportunity(id, {
            ...original,
            ...patch,
            items: undefined,
          });
        })
      );
      toast.success(`Đã cập nhật nhanh ${dirtyIds.length} cơ hội HĐ`);
      setDirtyMap({});
      await loadData();
    } catch {
      toast.error('Không thể lưu một số thay đổi trên Cơ hội HĐ');
    } finally {
      setSavingQuickEdit(false);
    }
  };

  const handleMoveStage = async (oppId: string, nextStage: string) => {
    try {
      await crmEnterpriseApi.updateOpportunityStage(oppId, nextStage);
      toast.success(`Đã chuyển sang "${nextStage}"`);
      loadData();
    } catch {
      toast.error('Không thể chuyển giai đoạn cơ hội');
    }
  };

  const handleConvertContract = async (opp: CrmOpportunityDto) => {
    if (opp.convertedContractId) {
      navigate(`${CRM_BASE}/sale-order/${opp.convertedContractId}`);
      return;
    }
    try {
      const contract = await crmEnterpriseApi.convertOpportunityToContract(opp.id);
      toast.success(`Đã sinh Hợp đồng ${contract.contractNumber}`);
      navigate(`${CRM_BASE}/sale-order/${contract.id}`);
    } catch {
      toast.error('Không thể sinh hợp đồng từ cơ hội này');
    }
  };

  const handleDeleteSingle = async (opp: CrmOpportunityDto) => {
    const ok = await confirm({
      title: 'Xóa Cơ hội HĐ',
      message: `Xóa cơ hội "${opp.opportunityName}" (${opp.code})?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await crmEnterpriseApi.deleteOpportunity(opp.id);
      toast.success('Đã xóa Cơ hội HĐ');
      loadData();
    } catch {
      toast.error('Không thể xóa Cơ hội HĐ');
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv(
      'danh-sach-co-hoi-hd.csv',
      [
        { header: 'Mã cơ hội', accessor: (r) => r.code },
        { header: 'Tên cơ hội', accessor: (r) => r.opportunityName },
        { header: 'Khách hàng', accessor: (r) => r.accountName },
        { header: 'Số tiền kỳ vọng', accessor: (r) => r.expectedRevenue },
        { header: 'Giai đoạn', accessor: (r) => r.stage },
        { header: 'Ngày kỳ vọng', accessor: (r) => formatDateVi(r.expectedCloseDate) },
        { header: 'Người thực hiện', accessor: (r) => r.assignedUserName },
      ],
      rows
    );
  };

  const actionSummaries = useMemo<CrmActionRecordSummary[]>(
    () =>
      allLoadedItems.map((r) => ({
        id: r.id,
        code: r.code,
        title: r.opportunityName,
        subtitle: r.accountName || r.contactName,
        status: r.stage,
        assignedUserName: r.assignedUserName,
        amount: r.expectedRevenue,
        updatedAt: r.updatedAt || r.createdAt,
      })),
    [allLoadedItems]
  );

  const fetchDeletedOpportunities = useCallback(async (): Promise<CrmActionRecordSummary[]> => {
    const res = await crmEnterpriseApi.listOpportunities({ deleted: true, page: 0, size: 100 });
    return res.rows.map((r) => ({
      id: r.id,
      code: r.code,
      title: r.opportunityName,
      subtitle: r.accountName || r.contactName,
      status: r.stage,
      assignedUserName: r.assignedUserName,
      amount: r.expectedRevenue,
      updatedAt: r.updatedAt || r.createdAt,
    }));
  }, []);

  const renderCell = (row: CrmOpportunityDto, colKey: string) => {
    const patch = dirtyMap[row.id] ?? {};
    const isQuickEdit = viewMode === 'quickEdit';

    switch (colKey) {
      case 'tags':
        return (
          <td key={colKey} className="px-3 py-2">
            <CrmTagList tags={row.tags} />
          </td>
        );

      case 'opportunityName':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="text"
              aria-label={`Tên cơ hội ${row.code}`}
              value={
                patch.opportunityName !== undefined
                  ? patch.opportunityName
                  : row.opportunityName || ''
              }
              onChange={(e) => setDirtyField(row, 'opportunityName', e.target.value)}
              className="h-7 w-full min-w-[200px] rounded border border-brand-line bg-white px-2 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="px-3 py-2">
            <Link
              to={`${CRM_BASE}/opportunity/${row.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-brand-primary hover:underline"
            >
              {row.opportunityName}
            </Link>
            <div className="text-[11px] tabular-nums text-brand-muted">
              {row.code}
              {row.accountName ? ` · ${row.accountName}` : ''}
            </div>
          </td>
        );

      case 'contactName':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="text"
              aria-label={`Liên hệ ${row.code}`}
              value={
                patch.contactName !== undefined
                  ? (patch.contactName ?? '')
                  : (row.contactName ?? '')
              }
              onChange={(e) => setDirtyField(row, 'contactName', e.target.value)}
              className="h-7 w-[150px] rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="px-3 py-2 text-brand-ink">
            <div>{row.contactName || '—'}</div>
            {row.contactPhone && (
              <div className="text-[11px] tabular-nums text-brand-muted">{row.contactPhone}</div>
            )}
          </td>
        );

      case 'expectedRevenue':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5 text-right">
            <input
              type="number"
              aria-label={`Số tiền ${row.code}`}
              value={
                patch.expectedRevenue !== undefined ? patch.expectedRevenue : row.expectedRevenue
              }
              onChange={(e) => setDirtyField(row, 'expectedRevenue', Number(e.target.value))}
              className="h-7 w-[120px] rounded border border-brand-line bg-white px-2 text-right text-xs font-semibold tabular-nums text-[#065f46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td
            key={colKey}
            className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-[#065f46]"
          >
            {formatVnd(row.expectedRevenue)}
          </td>
        );

      case 'stage':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <select
              aria-label={`Giai đoạn ${row.code}`}
              value={patch.stage ?? row.stage}
              onChange={(e) => setDirtyField(row, 'stage', e.target.value)}
              className="h-7 rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              {OPPORTUNITY_STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </td>
        ) : (
          <td key={colKey} className="px-3 py-2">
            <CrmStatusBadge status={row.stage} />
          </td>
        );

      case 'expectedCloseDate':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="date"
              aria-label={`Ngày kỳ vọng ${row.code}`}
              value={toDateInputValue(
                patch.expectedCloseDate !== undefined
                  ? patch.expectedCloseDate
                  : row.expectedCloseDate
              )}
              onChange={(e) => setDirtyField(row, 'expectedCloseDate', e.target.value)}
              className="h-7 w-[128px] rounded border border-brand-line bg-white px-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-ink">
            {formatDateVi(row.expectedCloseDate)}
          </td>
        );

      case 'serviceGroups':
        return (
          <td key={colKey} className="max-w-[200px] truncate px-3 py-2 text-brand-ink">
            {row.serviceGroups?.length ? row.serviceGroups.join(', ') : '—'}
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
              aria-label={`Người thực hiện ${row.code}`}
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

      case 'createdAt':
      case 'updatedAt':
        return (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-muted">
            {formatDateVi(row[colKey])}
          </td>
        );

      case 'opportunityTypes':
        return (
          <td key={colKey} className="max-w-[200px] truncate px-3 py-2 text-brand-ink">
            {row.opportunityTypes?.length ? row.opportunityTypes.join(', ') : '—'}
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
            ariaLabel="Chuyển chế độ xem Cơ hội HĐ"
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
            to={`${CRM_BASE}/opportunity/new`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Thêm</span>
          </Link>

          <CrmMoreActionsMenu
            moduleEndpoint="opportunities"
            moduleLabel="Cơ hội HĐ"
            records={actionSummaries}
            selectedIds={selectedIds}
            staffList={staffList}
            quickStats={quickStats}
            fetchDeletedRecords={fetchDeletedOpportunities}
            onReload={loadData}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-brand-line bg-white">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line px-3 py-2">
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
                placeholder="Tìm mã CH, tên cơ hội, khách hàng, liên hệ..."
                aria-label="Tìm kiếm Cơ hội HĐ"
                className="h-8 w-full rounded-md border border-brand-line bg-brand-surface pl-8 pr-3 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={loadData}
                aria-label="Tải lại Cơ hội HĐ"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <RefreshCw size={14} aria-hidden="true" />
              </button>

              {viewMode !== 'kanban' && (
                <>
                  <button
                    type="button"
                    onClick={() => setDesignerState({ open: true, mode: 'edit' })}
                    aria-label="Thiết lập giao diện bảng Cơ hội HĐ"
                    title="Sửa giao diện"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-muted hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <Settings size={14} aria-hidden="true" />
                  </button>

                  <CrmColumnPicker
                    columns={OPPORTUNITY_ALL_COLUMNS}
                    visibleKeys={activeView.columns}
                    onToggle={toggleColumnOnActiveView}
                    onReset={resetActiveViewToDefault}
                  />

                  <button
                    type="button"
                    onClick={() => setShowActivity((v) => !v)}
                    aria-pressed={showActivity}
                    aria-label="Bật tắt khung xem nhanh hoạt động"
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${showActivity
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
                className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${showFilter
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

          {/* KanBan View */}
          {viewMode === 'kanban' ? (
            <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto bg-brand-surface/50 p-3">
              {kanbanColumns.map((col) => (
                <div
                  key={col.stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedOppId) {
                      handleMoveStage(draggedOppId, col.stage);
                      setDraggedOppId(null);
                    }
                  }}
                  className="flex h-full w-[280px] shrink-0 flex-col rounded-lg border border-brand-line bg-white"
                >
                  <div className="border-b border-brand-line bg-brand-surface px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="truncate text-xs font-bold text-brand-ink">{col.stage}</h2>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold tabular-nums text-brand-primary">
                        {col.count}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold tabular-nums text-brand-muted">
                      Kỳ vọng:{' '}
                      <span className="text-brand-ink">
                        {formatVnd(col.totalExpectedRevenue, true)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
                    {col.items.length === 0 ? (
                      <div className="rounded-md border border-dashed border-brand-line p-4 text-center text-[11px] text-brand-muted">
                        Kéo thả thẻ cơ hội vào giai đoạn này
                      </div>
                    ) : (
                      col.items.map((item) => (
                        <article
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedOppId(item.id)}
                          onDragEnd={() => setDraggedOppId(null)}
                          className="space-y-2 rounded-lg border border-brand-line bg-white p-3 transition-shadow hover:shadow-card"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`${CRM_BASE}/opportunity/${item.id}`}
                              className="text-xs font-semibold text-brand-primary hover:underline"
                            >
                              {item.opportunityName}
                            </Link>
                            <span className="shrink-0 text-[10px] tabular-nums text-brand-muted">
                              {item.code}
                            </span>
                          </div>

                          {item.accountName && (
                            <div className="truncate text-[11px] text-brand-ink">
                              {item.accountName}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs">
                            <strong className="font-bold tabular-nums text-[#065f46]">
                              {formatVnd(item.expectedRevenue, true)}
                            </strong>
                            <span className="tabular-nums text-[11px] text-brand-muted">
                              {formatDateVi(item.expectedCloseDate)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 border-t border-brand-line pt-2">
                            <select
                              aria-label={`Chuyển giai đoạn cho ${item.opportunityName}`}
                              value={item.stage}
                              onChange={(e) => handleMoveStage(item.id, e.target.value)}
                              className="min-w-0 flex-1 rounded border border-brand-line bg-brand-surface px-1.5 py-1 text-[11px] text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              {OPPORTUNITY_STAGES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleConvertContract(item)}
                              aria-label={`Sinh hợp đồng từ ${item.opportunityName}`}
                              title="Sinh hợp đồng"
                              className="rounded border border-brand-line p-1 text-brand-primary hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <FileCheck2 size={13} aria-hidden="true" />
                            </button>
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
              {/* Dynamic Opportunity Table */}
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="min-w-[1340px] w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 z-20 border-b border-brand-line bg-brand-surface text-brand-ink">
                    <tr>
                        <th className="crm-sticky-left sticky left-0 z-30 w-10 border-r border-brand-line bg-brand-surface px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={rows.length > 0 && selectedIds.length === rows.length}
                            onChange={() =>
                              setSelectedIds(
                                selectedIds.length === rows.length ? [] : rows.map((r) => r.id)
                              )
                            }
                            aria-label="Chọn tất cả Cơ hội HĐ"
                            className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                          />
                        </th>
                        {activeColumns.map((col) => (
                          <th
                            key={col.key}
                            className={`whitespace-nowrap px-3 py-2.5 font-bold ${col.key === 'expectedRevenue' ? 'text-right' : ''
                              } ${col.key === 'opportunityName' ? 'min-w-[240px]' : ''}`}
                          >
                            {col.label}
                          </th>
                        ))}
                          <th className="crm-sticky-right sticky right-0 z-30 w-28 border-l border-brand-line bg-brand-surface px-2.5 py-2.5 text-center font-bold">
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
                                Chưa có Cơ hội HĐ nào
                              </p>
                              <p className="mt-1 text-xs text-brand-muted">
                                Tạo mới Cơ hội HĐ hoặc chuyển sang chế độ KanBan để theo dõi 7 bước tư
                                vấn hồ sơ.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          rows.map((row) => {
                            const isSelected = selectedIds.includes(row.id);
                            const isCurrent = activeOpp?.id === row.id;
                            const isDirty = Boolean(dirtyMap[row.id]);
                            return (
                              <tr
                                key={row.id}
                                onClick={() => setActiveOpp(row)}
                                className={`cursor-pointer transition-colors ${isDirty
                                      ? 'bg-[#fff8e1]'
                                      : isSelected || isCurrent
                                        ? 'bg-brand-surface'
                                    : 'bg-white hover:bg-[#f6fbf9]'
                                  }`}
                              >
                                <td
                                  onClick={(e) => e.stopPropagation()}
                                  className="crm-sticky-left sticky left-0 z-10 border-r border-brand-line bg-inherit px-3 py-2 text-center"
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
                                    aria-label={`Chọn cơ hội ${row.opportunityName}`}
                                    className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                                  />
                                </td>

                                {activeColumns.map((col) => renderCell(row, col.key))}

                                <td
                                  onClick={(e) => e.stopPropagation()}
                                  className="crm-sticky-right sticky right-0 z-10 border-l border-brand-line bg-inherit px-2 py-2"
                                >
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleConvertContract(row)}
                                      aria-label={`Sinh hợp đồng từ ${row.opportunityName}`}
                                      title="Sinh hợp đồng"
                                      className="rounded p-1 text-brand-primary hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                    >
                                      <FileCheck2 size={14} aria-hidden="true" />
                                    </button>
                                    <Link
                                      to={`${CRM_BASE}/opportunity/${row.id}/edit`}
                                      aria-label={`Sửa ${row.opportunityName}`}
                                      className="rounded p-1 text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                    >
                                      <Pencil size={14} aria-hidden="true" />
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSingle(row)}
                                      aria-label={`Xóa ${row.opportunityName}`}
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
                    kpis={footerKpis}
                    onConfigureSummary={() => setDesignerState({ open: true, mode: 'edit' })}
                  />
                </>
          )}
              </div>

              {viewMode !== 'kanban' && showActivity && (
                <CrmQuickActivityPanel
                  docked
                  entityType="OPPORTUNITY"
                  entityId={activeOpp?.id}
                  entityLabel={activeOpp?.opportunityName}
                  entityPhone={activeOpp?.contactPhone}
                  onClose={() => setShowActivity(false)}
                />
              )}

              <CrmFilterPanel
                open={showFilter}
                onClose={() => setShowFilter(false)}
                presets={OPPORTUNITY_SAVED_PRESETS}
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
                storageKey="luatpoip.crm.opportunity.savedFilters"
                quickStats={quickStats}
              />
            </div>

          <CrmViewDesignerModal
            open={designerState.open}
            mode={designerState.mode}
            view={activeView}
            allColumns={OPPORTUNITY_ALL_COLUMNS}
            defaultColumnKeys={OPPORTUNITY_DEFAULT_COLUMN_KEYS}
            allSummaryFields={OPPORTUNITY_ALL_SUMMARY_FIELDS}
            defaultSummaryKeys={OPPORTUNITY_DEFAULT_SUMMARY_KEYS}
            sortFields={OPPORTUNITY_SORT_FIELDS}
            defaultSortField="createdAt"
            onClose={() => setDesignerState((prev) => ({ ...prev, open: false }))}
            onSave={saveView}
            onDelete={deleteView}
          />

          <CrmImportModal
            open={showImport}
            title="Nhập danh sách Cơ hội HĐ từ Excel / CSV"
            sampleCsvHeader="Tên cơ hội,Khách hàng,Liên hệ,Số tiền,Giai đoạn,Ngày kỳ vọng/kết thúc"
            sampleCsvRow="Đăng ký nhãn hiệu độc quyền 3 nhóm,Công ty Cổ phần Sao Việt,Trần Minh Quân,15000000,1/ Liên hệ tư vấn & báo phí,2026-12-15"
            mappings={OPPORTUNITY_IMPORT_MAPPINGS}
            onClose={() => setShowImport(false)}
            onImport={(items) => crmEnterpriseApi.importOpportunities(items)}
            onSuccess={loadData}
          />
        </div>
        );
}
