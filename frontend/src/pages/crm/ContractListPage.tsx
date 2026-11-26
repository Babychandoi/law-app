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
import {
  CONTRACT_SAVED_PRESETS,
  CRM_DEPARTMENTS,
  EXECUTION_STATUSES,
  REVENUE_STATUSES,
} from '../../features/crm/constants';
import {
  buildContractFilterFields,
  extractAssigneeOptions,
} from '../../features/crm/filterConfigs';
import {
  exportRowsToCsv,
  formatDateVi,
  formatVnd,
  toDateInputValue,
} from '../../features/crm/formatters';
import type {
  CrmContractDto,
  CrmContractSummaryDto,
  CrmContractWritePayload,
  CrmFilterRule,
  PageMeta,
} from '../../features/crm/types';
import {
  CONTRACT_ALL_COLUMNS,
  CONTRACT_ALL_SUMMARY_FIELDS,
  CONTRACT_DEFAULT_COLUMN_KEYS,
  CONTRACT_DEFAULT_SUMMARY_KEYS,
  CONTRACT_SORT_FIELDS,
  CONTRACT_SYSTEM_VIEWS,
  useCrmSavedViews,
} from '../../features/crm/viewConfigs';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

type ContractKanbanGroup = 'executionStatus' | 'revenueStatus';

const RIGHT_ALIGNED_KEYS = new Set([
  'orderValue',
  'collectedAmount',
  'actualExpense',
  'plannedExpense',
  'receivableAmount',
  'payableAmount',
  'estimatedProfit',
  'serviceExpense',
  'stateFeeExpense',
  'supportExpense',
  'liquidationValue',
  'uninvoicedAmount',
]);

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
    'luatpoip.crm.contract',
    CONTRACT_SYSTEM_VIEWS,
    CONTRACT_ALL_COLUMNS,
    CONTRACT_DEFAULT_COLUMN_KEYS,
    CONTRACT_DEFAULT_SUMMARY_KEYS,
    'bookingDate'
  );

  const [viewMode, setViewMode] = useState<CrmViewMode>('list');
  const [kanbanGroupBy, setKanbanGroupBy] = useState<ContractKanbanGroup>('executionStatus');
  const [draggedContractId, setDraggedContractId] = useState<string | null>(null);

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
  const [filterRules, setFilterRules] = useState<CrmFilterRule[]>([]);
  const [activePreset, setActivePreset] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeContract, setActiveContract] = useState<CrmContractDto | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [designerState, setDesignerState] = useState<{
    open: boolean;
    mode: 'edit' | 'create';
  }>({ open: false, mode: 'edit' });

  // Quick-Edit state
  const [dirtyMap, setDirtyMap] = useState<Record<string, CrmContractWritePayload>>({});
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
      const effectiveSize = viewMode === 'kanban' ? Math.max(pageSize, 100) : pageSize;
      const effectivePage = viewMode === 'kanban' ? 0 : page;
      const res = await crmEnterpriseApi.listContracts({
        keyword: debouncedKeyword || undefined,
        preset: activePreset || activeView.preset || undefined,
        filters: combinedFilters.length > 0 ? combinedFilters : undefined,
        sort: `${activeView.sortField},${activeView.sortDir}`,
        page: effectivePage,
        size: effectiveSize,
      });
      setRows(res.rows);
      setSummary(res.summary);
      setMeta(res.meta);
      setSelectedIds([]);
      setDirtyMap({});
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
  }, [
    viewMode,
    debouncedKeyword,
    activePreset,
    activeView.preset,
    activeView.sortField,
    activeView.sortDir,
    combinedFilters,
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

  const filterFields = useMemo(() => buildContractFilterFields(assigneeOptions), [assigneeOptions]);

  const activeColumns = useMemo<CrmColumnOption[]>(() => {
    const resolved = activeView.columns
      .map((key) => CONTRACT_ALL_COLUMNS.find((c) => c.key === key))
      .filter((c): c is CrmColumnOption => Boolean(c));
    return resolved.length > 0 ? resolved : CONTRACT_ALL_COLUMNS.slice(0, 16);
  }, [activeView.columns]);

  const quickStats = useMemo(
    () =>
      buildQuickStatsGroups(rows, {
        statusLabel: 'Theo Tình trạng thực hiện HĐ',
        getStatus: (r) => r.executionStatus,
        getAssignee: (r) => r.assignedUserName,
        getSource: (r) => r.leadSource,
        getAmount: (r) => r.orderValue,
      }),
    [rows]
  );

  const footerKpis = useMemo<CrmFooterKpiItem[]>(() => {
    const summaryLookup: Record<
      string,
      { label: string; amount: number; tone?: CrmFooterKpiItem['tone'] }
    > = {
      orderValue: {
        label: 'Giá trị đơn hàng',
        amount: summary.totalOrderValue ?? 0,
        tone: 'default',
      },
      collectedAmount: {
        label: 'Thực thu',
        amount: summary.totalCollected ?? 0,
        tone: 'emerald',
      },
      receivableAmount: {
        label: 'Còn phải thu',
        amount: summary.totalReceivable ?? 0,
        tone: 'rose',
      },
      estimatedProfit: {
        label: 'Dự kiến lãi lỗ',
        amount: summary.totalEstimatedProfit ?? 0,
        tone: (summary.totalEstimatedProfit ?? 0) >= 0 ? 'teal' : 'rose',
      },
      actualExpense: {
        label: 'Thực chi',
        amount: summary.totalActualExpense ?? 0,
        tone: 'default',
      },
      plannedExpense: {
        label: 'Dự kiến chi',
        amount: summary.totalPlannedExpense ?? 0,
        tone: 'default',
      },
      payableAmount: {
        label: 'Còn phải chi',
        amount: summary.totalPayable ?? 0,
        tone: 'rose',
      },
      serviceExpense: {
        label: 'Chi dịch vụ',
        amount: summary.totalServiceExpense ?? 0,
        tone: 'default',
      },
      stateFeeExpense: {
        label: 'Chi nhà nước',
        amount: summary.totalStateFeeExpense ?? 0,
        tone: 'default',
      },
      supportExpense: {
        label: 'Chi hỗ trợ',
        amount: summary.totalSupportExpense ?? 0,
        tone: 'default',
      },
      liquidationValue: {
        label: 'Giá trị thanh lý',
        amount: summary.totalLiquidationValue ?? 0,
        tone: 'default',
      },
      uninvoicedAmount: {
        label: 'Giá trị chưa xuất hóa đơn',
        amount: summary.totalUninvoicedAmount ?? 0,
        tone: 'default',
      },
    };

    const keys =
      activeView.summaryKeys.length > 0 ? activeView.summaryKeys : CONTRACT_DEFAULT_SUMMARY_KEYS;
    return keys
      .map((k) => summaryLookup[k])
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        label: item.label,
        value: formatVnd(item.amount),
        tone: item.tone,
      }));
  }, [summary, activeView.summaryKeys]);

  const setDirtyField = <K extends keyof CrmContractWritePayload>(
    row: CrmContractDto,
    key: K,
    value: CrmContractWritePayload[K]
  ) => {
    setDirtyMap((prev) => {
      const existing = prev[row.id] ?? {};
      const nextPatch: CrmContractWritePayload = {
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
          const orderVal = Number(patch.orderValue ?? original.orderValue ?? 0);
          const collectedVal = Number(patch.collectedAmount ?? original.collectedAmount ?? 0);
          const actualExp = Number(patch.actualExpense ?? original.actualExpense ?? 0);
          const plannedExp = Number(patch.plannedExpense ?? original.plannedExpense ?? 0);

          return crmEnterpriseApi.updateContract(id, {
            ...original,
            ...patch,
            orderValue: orderVal,
            collectedAmount: collectedVal,
            actualExpense: actualExp,
            plannedExpense: plannedExp,
            receivableAmount: orderVal - collectedVal,
            payableAmount: Math.max(0, plannedExp - actualExp),
            estimatedProfit: orderVal - Math.max(plannedExp, actualExp),
            items: undefined,
          });
        })
      );
      toast.success(`Đã cập nhật nhanh ${dirtyIds.length} hợp đồng`);
      setDirtyMap({});
      await loadData();
    } catch {
      toast.error('Không thể lưu một số thay đổi trên Hợp đồng');
    } finally {
      setSavingQuickEdit(false);
    }
  };

  const handleMoveContractKanban = async (contract: CrmContractDto, nextStage: string) => {
    try {
      if (kanbanGroupBy === 'revenueStatus') {
        if (contract.revenueStatus === nextStage) return;
        await crmEnterpriseApi.updateContractRevenueStatus(contract.id, nextStage);
      } else {
        if (contract.executionStatus === nextStage) return;
        await crmEnterpriseApi.updateContract(contract.id, {
          ...contract,
          executionStatus: nextStage,
          items: undefined,
        });
      }
      toast.success(`Đã chuyển sang "${nextStage}"`);
      loadData();
    } catch {
      toast.error('Không thể cập nhật trạng thái Hợp đồng');
    }
  };

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

  const kanbanStageList = kanbanGroupBy === 'revenueStatus' ? REVENUE_STATUSES : EXECUTION_STATUSES;

  const kanbanColumns = useMemo(
    () =>
      kanbanStageList.map((stage) => {
        const colItems = rows.filter((r) =>
          kanbanGroupBy === 'revenueStatus'
            ? r.revenueStatus === stage
            : r.executionStatus === stage
        );
        const totalOrderValue = colItems.reduce((sum, item) => sum + item.orderValue, 0);
        return {
          stage,
          count: colItems.length,
          totalOrderValue,
          items: colItems,
        };
      }),
    [kanbanStageList, rows, kanbanGroupBy]
  );

  const actionSummaries = useMemo<CrmActionRecordSummary[]>(
    () =>
      rows.map((r) => ({
        id: r.id,
        code: r.contractNumber,
        title: r.accountName || r.contractNumber,
        subtitle: r.goodsSummary,
        status: r.executionStatus,
        assignedUserName: r.assignedUserName,
        amount: r.orderValue,
        updatedAt: r.updatedAt || r.bookingDate,
      })),
    [rows]
  );

  const fetchDeletedContracts = useCallback(async (): Promise<CrmActionRecordSummary[]> => {
    const res = await crmEnterpriseApi.listContracts({ deleted: true, page: 0, size: 100 });
    return res.rows.map((r) => ({
      id: r.id,
      code: r.contractNumber,
      title: r.accountName || r.contractNumber,
      subtitle: r.goodsSummary,
      status: r.executionStatus,
      assignedUserName: r.assignedUserName,
      amount: r.orderValue,
      updatedAt: r.updatedAt || r.bookingDate,
    }));
  }, []);

  const renderCell = (row: CrmContractDto, colKey: string) => {
    const patch = dirtyMap[row.id] ?? {};
    const isQuickEdit = viewMode === 'quickEdit';

    const orderVal = Number(patch.orderValue ?? row.orderValue ?? 0);
    const collectedVal = Number(patch.collectedAmount ?? row.collectedAmount ?? 0);
    const actualExp = Number(patch.actualExpense ?? row.actualExpense ?? 0);
    const plannedExp = Number(patch.plannedExpense ?? row.plannedExpense ?? 0);
    const liveReceivable =
      patch.orderValue !== undefined || patch.collectedAmount !== undefined
        ? orderVal - collectedVal
        : row.receivableAmount;
    const livePayable =
      patch.plannedExpense !== undefined || patch.actualExpense !== undefined
        ? Math.max(0, plannedExp - actualExp)
        : row.payableAmount;
    const liveProfit =
      patch.orderValue !== undefined ||
      patch.plannedExpense !== undefined ||
      patch.actualExpense !== undefined
        ? orderVal - Math.max(plannedExp, actualExp)
        : row.estimatedProfit;

    switch (colKey) {
      case 'bookingDate':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="date"
              aria-label={`Ngày ghi sổ ${row.contractNumber}`}
              value={toDateInputValue(
                patch.bookingDate !== undefined ? patch.bookingDate : row.bookingDate
              )}
              onChange={(e) => setDirtyField(row, 'bookingDate', e.target.value)}
              className="h-7 w-[128px] rounded border border-brand-line bg-white px-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-ink">
            {formatDateVi(row.bookingDate)}
          </td>
        );

      case 'paymentDate':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="date"
              aria-label={`Ngày thanh toán ${row.contractNumber}`}
              value={toDateInputValue(
                patch.paymentDate !== undefined ? patch.paymentDate : row.paymentDate
              )}
              onChange={(e) => setDirtyField(row, 'paymentDate', e.target.value)}
              className="h-7 w-[128px] rounded border border-brand-line bg-white px-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-muted">
            {formatDateVi(row.paymentDate)}
          </td>
        );

      case 'goodsSummary':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="text"
              aria-label={`Hàng hóa ${row.contractNumber}`}
              value={
                patch.goodsSummary !== undefined
                  ? (patch.goodsSummary ?? '')
                  : (row.goodsSummary ?? '')
              }
              onChange={(e) => setDirtyField(row, 'goodsSummary', e.target.value)}
              className="h-7 w-full min-w-[180px] rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="max-w-[240px] truncate px-3 py-2 text-brand-ink">
            {row.goodsSummary || row.items?.map((i) => i.description).join(', ') || '—'}
          </td>
        );

      case 'revenueStatus':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <select
              aria-label={`Tình trạng ghi doanh số ${row.contractNumber}`}
              value={patch.revenueStatus ?? row.revenueStatus}
              onChange={(e) => setDirtyField(row, 'revenueStatus', e.target.value)}
              className="h-7 rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              {REVENUE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </td>
        ) : (
          <td key={colKey} className="px-3 py-2">
            <CrmStatusBadge status={row.revenueStatus} />
          </td>
        );

      case 'executionStatus':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <select
              aria-label={`Tình trạng thực hiện HĐ ${row.contractNumber}`}
              value={patch.executionStatus ?? row.executionStatus}
              onChange={(e) => setDirtyField(row, 'executionStatus', e.target.value)}
              className="h-7 rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              {EXECUTION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </td>
        ) : (
          <td key={colKey} className="px-3 py-2">
            <CrmStatusBadge status={row.executionStatus} />
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
              aria-label={`Người phụ trách ${row.contractNumber}`}
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

      case 'contractNumber':
        return (
          <td key={colKey} className="whitespace-nowrap px-3 py-2">
            <Link
              to={`${CRM_BASE}/sale-order/${row.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold tabular-nums text-brand-primary hover:underline"
            >
              {row.contractNumber}
            </Link>
          </td>
        );

      case 'accountName':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <input
              type="text"
              aria-label={`Khách hàng ${row.contractNumber}`}
              value={
                patch.accountName !== undefined
                  ? (patch.accountName ?? '')
                  : (row.accountName ?? '')
              }
              onChange={(e) => setDirtyField(row, 'accountName', e.target.value)}
              className="h-7 w-full min-w-[175px] rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td key={colKey} className="max-w-[230px] truncate px-3 py-2">
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
        );

      case 'orderValue':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5 text-right">
            <input
              type="number"
              aria-label={`Giá trị đơn hàng ${row.contractNumber}`}
              value={orderVal}
              onChange={(e) => setDirtyField(row, 'orderValue', Number(e.target.value))}
              className="h-7 w-[118px] rounded border border-brand-line bg-white px-2 text-right text-xs font-semibold tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td
            key={colKey}
            className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-brand-ink"
          >
            {formatVnd(row.orderValue)}
          </td>
        );

      case 'collectedAmount':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5 text-right">
            <input
              type="number"
              aria-label={`Thực thu ${row.contractNumber}`}
              value={collectedVal}
              onChange={(e) => setDirtyField(row, 'collectedAmount', Number(e.target.value))}
              className="h-7 w-[118px] rounded border border-brand-line bg-white px-2 text-right text-xs font-semibold tabular-nums text-[#065f46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td
            key={colKey}
            className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-[#065f46]"
          >
            {formatVnd(row.collectedAmount)}
          </td>
        );

      case 'actualExpense':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5 text-right">
            <input
              type="number"
              aria-label={`Thực chi ${row.contractNumber}`}
              value={actualExp}
              onChange={(e) => setDirtyField(row, 'actualExpense', Number(e.target.value))}
              className="h-7 w-[112px] rounded border border-brand-line bg-white px-2 text-right text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td
            key={colKey}
            className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-brand-ink"
          >
            {formatVnd(row.actualExpense)}
          </td>
        );

      case 'plannedExpense':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5 text-right">
            <input
              type="number"
              aria-label={`Dự kiến chi ${row.contractNumber}`}
              value={plannedExp}
              onChange={(e) => setDirtyField(row, 'plannedExpense', Number(e.target.value))}
              className="h-7 w-[112px] rounded border border-brand-line bg-white px-2 text-right text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </td>
        ) : (
          <td
            key={colKey}
            className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-brand-muted"
          >
            {formatVnd(row.plannedExpense)}
          </td>
        );

      case 'receivableAmount':
        return (
          <td
            key={colKey}
            className="whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums text-[#9f1239]"
          >
            {formatVnd(liveReceivable)}
          </td>
        );

      case 'payableAmount':
        return (
          <td
            key={colKey}
            className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-brand-muted"
          >
            {formatVnd(livePayable)}
          </td>
        );

      case 'estimatedProfit':
        return (
          <td
            key={colKey}
            className={`whitespace-nowrap px-3 py-2 text-right font-bold tabular-nums ${
              liveProfit >= 0 ? 'text-[#065f46]' : 'text-[#9f1239]'
            }`}
          >
            {formatVnd(liveProfit)}
          </td>
        );

      case 'department':
        return isQuickEdit ? (
          <td key={colKey} onClick={(e) => e.stopPropagation()} className="px-2 py-1.5">
            <select
              aria-label={`Bộ phận phụ trách ${row.contractNumber}`}
              value={
                patch.department !== undefined ? (patch.department ?? '') : (row.department ?? '')
              }
              onChange={(e) => setDirtyField(row, 'department', e.target.value)}
              className="h-7 min-w-[150px] rounded border border-brand-line bg-white px-2 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <option value="">-- Chọn bộ phận --</option>
              {CRM_DEPARTMENTS.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </td>
        ) : (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 text-brand-muted">
            {row.department || '—'}
          </td>
        );

      // Extended columns
      case 'serviceExpense':
      case 'stateFeeExpense':
      case 'supportExpense':
      case 'liquidationValue':
      case 'uninvoicedAmount':
        return (
          <td
            key={colKey}
            className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-brand-ink"
          >
            {formatVnd(row[colKey])}
          </td>
        );

      case 'submissionDate':
      case 'handoverDeadline':
      case 'productionDeadline':
      case 'orderDate':
      case 'createdAt':
        return (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-muted">
            {formatDateVi(row[colKey])}
          </td>
        );

      case 'tags':
        return (
          <td key={colKey} className="px-3 py-2">
            <CrmTagList tags={row.tags} />
          </td>
        );

      case 'shared':
        return (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 text-brand-muted">
            {row.shared ? 'Có' : 'Không'}
          </td>
        );

      default: {
        const rawVal = (row as unknown as Record<string, unknown>)[colKey];
        return (
          <td key={colKey} className="whitespace-nowrap px-3 py-2 text-brand-ink">
            {rawVal ? String(rawVal) : '—'}
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
            ariaLabel="Chuyển chế độ xem Hợp đồng"
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
            to={`${CRM_BASE}/sale-order/new`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Thêm</span>
          </Link>

          <CrmMoreActionsMenu
            moduleEndpoint="contracts"
            moduleLabel="Hợp đồng"
            records={actionSummaries}
            selectedIds={selectedIds}
            staffList={staffList}
            quickStats={quickStats}
            fetchDeletedRecords={fetchDeletedContracts}
            onReload={loadData}
          />
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

              {viewMode === 'kanban' && (
                <select
                  aria-label="Nhóm KanBan Hợp đồng theo"
                  value={kanbanGroupBy}
                  onChange={(e) => setKanbanGroupBy(e.target.value as ContractKanbanGroup)}
                  className="h-8 rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="executionStatus">Nhóm theo: Tình trạng thực hiện HĐ</option>
                  <option value="revenueStatus">Nhóm theo: Tình trạng ghi doanh số</option>
                </select>
              )}

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

              {viewMode !== 'kanban' && (
                <>
                  <button
                    type="button"
                    onClick={() => setDesignerState({ open: true, mode: 'edit' })}
                    aria-label="Thiết lập giao diện bảng Hợp đồng"
                    title="Sửa giao diện"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-muted hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <Settings size={14} aria-hidden="true" />
                  </button>

                  <CrmColumnPicker
                    columns={CONTRACT_ALL_COLUMNS}
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
                if (dirtyIds.length > 0) {
                  setDirtyMap({});
                } else {
                  setViewMode('list');
                }
              }}
              onSave={handleSaveQuickEdit}
            />
          )}

          {viewMode === 'kanban' ? (
            <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto bg-brand-surface/50 p-3">
              {kanbanColumns.map((col) => (
                <div
                  key={col.stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedContractId) {
                      const found = rows.find((r) => r.id === draggedContractId);
                      if (found) {
                        handleMoveContractKanban(found, col.stage);
                      }
                      setDraggedContractId(null);
                    }
                  }}
                  className="flex h-full w-[290px] shrink-0 flex-col rounded-lg border border-brand-line bg-white"
                >
                  <div className="border-b border-brand-line bg-brand-surface px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="truncate text-xs font-bold text-brand-ink">{col.stage}</h2>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold tabular-nums text-brand-primary">
                        {col.count}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold tabular-nums text-brand-muted">
                      Tổng giá trị:{' '}
                      <span className="text-brand-ink">{formatVnd(col.totalOrderValue, true)}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
                    {col.items.length === 0 ? (
                      <div className="rounded-md border border-dashed border-brand-line p-4 text-center text-[11px] text-brand-muted">
                        Kéo thả hợp đồng vào cột này
                      </div>
                    ) : (
                      col.items.map((item) => {
                        const curStage =
                          kanbanGroupBy === 'revenueStatus'
                            ? item.revenueStatus
                            : item.executionStatus;
                        return (
                          <article
                            key={item.id}
                            draggable
                            onDragStart={() => setDraggedContractId(item.id)}
                            onDragEnd={() => setDraggedContractId(null)}
                            className="space-y-2 rounded-lg border border-brand-line bg-white p-3 transition-shadow hover:shadow-card"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`${CRM_BASE}/sale-order/${item.id}`}
                                className="text-xs font-bold tabular-nums text-brand-primary hover:underline"
                              >
                                {item.contractNumber}
                              </Link>
                              <span className="shrink-0 text-[11px] tabular-nums text-brand-muted">
                                {formatDateVi(item.bookingDate)}
                              </span>
                            </div>

                            {item.accountName && (
                              <div className="truncate text-xs font-semibold text-brand-ink">
                                {item.accountName}
                              </div>
                            )}

                            {item.goodsSummary && (
                              <div className="line-clamp-2 text-[11px] text-brand-muted">
                                {item.goodsSummary}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                              <strong className="font-bold tabular-nums text-[#065f46]">
                                {formatVnd(item.orderValue, true)}
                              </strong>
                              {item.receivableAmount > 0 && (
                                <span className="text-[11px] font-semibold tabular-nums text-[#9f1239]">
                                  Nợ: {formatVnd(item.receivableAmount, true)}
                                </span>
                              )}
                            </div>

                            {item.assignedUserName && (
                              <div>
                                <CrmAssigneePill name={item.assignedUserName} />
                              </div>
                            )}

                            <div className="border-t border-brand-line pt-2">
                              <select
                                aria-label={`Chuyển trạng thái cho ${item.contractNumber}`}
                                value={curStage}
                                onChange={(e) => handleMoveContractKanban(item, e.target.value)}
                                className="w-full rounded border border-brand-line bg-brand-surface px-2 py-1 text-[11px] text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                              >
                                {kanbanStageList.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Dynamic MISA Contract Table */}
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="min-w-[2050px] w-full border-collapse text-left text-xs">
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
                          aria-label="Chọn tất cả Hợp đồng trên trang"
                          className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                        />
                      </th>
                      {activeColumns.map((col) => (
                        <th
                          key={col.key}
                          className={`whitespace-nowrap px-3 py-2.5 font-bold ${
                            RIGHT_ALIGNED_KEYS.has(col.key) ? 'text-right' : ''
                          } ${
                            col.key === 'goodsSummary' || col.key === 'accountName'
                              ? 'min-w-[210px]'
                              : ''
                          }`}
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
                            Chưa có Hợp đồng phù hợp điều kiện lọc
                          </p>
                          <p className="mt-1 text-xs text-brand-muted">
                            Nhấn &ldquo;+ Thêm&rdquo; để lập hợp đồng dịch vụ pháp lý hoặc sinh tự
                            động từ Cơ hội HĐ / Khách hàng.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => {
                        const isSelected = selectedIds.includes(row.id);
                        const isCurrent = activeContract?.id === row.id;
                        const isDirty = Boolean(dirtyMap[row.id]);
                        return (
                          <tr
                            key={row.id}
                            onClick={() => setActiveContract(row)}
                            className={`cursor-pointer transition-colors ${
                              isDirty
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
                                aria-label={`Chọn hợp đồng ${row.contractNumber}`}
                                className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                              />
                            </td>

                            {activeColumns.map((col) => renderCell(row, col.key))}

                            <td
                              onClick={(e) => e.stopPropagation()}
                              className="crm-sticky-right sticky right-0 z-10 border-l border-brand-line bg-inherit px-2 py-2"
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
                kpis={footerKpis}
                onConfigureSummary={() => setDesignerState({ open: true, mode: 'edit' })}
              />
            </>
          )}
        </div>

        {viewMode !== 'kanban' && showActivity && (
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
          storageKey="luatpoip.crm.contract.savedFilters"
          quickStats={quickStats}
        />
      </div>

      <CrmViewDesignerModal
        open={designerState.open}
        mode={designerState.mode}
        view={activeView}
        allColumns={CONTRACT_ALL_COLUMNS}
        defaultColumnKeys={CONTRACT_DEFAULT_COLUMN_KEYS}
        allSummaryFields={CONTRACT_ALL_SUMMARY_FIELDS}
        defaultSummaryKeys={CONTRACT_DEFAULT_SUMMARY_KEYS}
        sortFields={CONTRACT_SORT_FIELDS}
        defaultSortField="bookingDate"
        onClose={() => setDesignerState((prev) => ({ ...prev, open: false }))}
        onSave={saveView}
        onDelete={deleteView}
      />

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
