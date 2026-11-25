import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Download,
  FileCheck2,
  Filter,
  Kanban,
  List,
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
import CrmStatusBadge, { CrmAssigneePill, CrmTagList } from '../../features/crm/CrmStatusBadge';
import {
  CRM_SERVICE_GROUPS,
  OPPORTUNITY_SAVED_PRESETS,
  OPPORTUNITY_STAGES,
} from '../../features/crm/constants';
import { exportRowsToCsv, formatDateVi, formatVnd } from '../../features/crm/formatters';
import type { CrmKanbanColumnDto, CrmOpportunityDto, PageMeta } from '../../features/crm/types';
import { CRM_BASE, useCrmWorkspace } from './CrmWorkspaceLayout';

type OppViewMode = 'list' | 'kanban';

const OPPORTUNITY_COLUMNS: CrmColumnOption[] = [
  { key: 'tags', label: 'Thẻ' },
  { key: 'opportunityName', label: 'Tên cơ hội', locked: true },
  { key: 'contactName', label: 'Liên hệ' },
  { key: 'expectedRevenue', label: 'Số tiền', locked: true },
  { key: 'stage', label: 'Giai đoạn' },
  { key: 'expectedCloseDate', label: 'Ngày kỳ vọng/kết thúc' },
  { key: 'serviceGroups', label: 'Loại hàng hóa' },
  { key: 'assignedUserName', label: 'Người thực hiện' },
  { key: 'createdAt', label: 'Ngày tạo' },
];

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
  const { staffList } = useCrmWorkspace();
  const { confirm, confirmDialog } = useConfirm();

  const [viewMode, setViewMode] = useState<OppViewMode>('list');
  const [rows, setRows] = useState<CrmOpportunityDto[]>([]);
  const [kanbanColumns, setKanbanColumns] = useState<CrmKanbanColumnDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [activePreset, setActivePreset] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeOpp, setActiveOpp] = useState<CrmOpportunityDto | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);

  const { visibleKeys, toggleColumn, resetColumns } = usePersistedColumns(
    'luatpoip.crm.opportunity.columns',
    OPPORTUNITY_COLUMNS
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
          assignedTo: filterValues.assignedTo || undefined,
          serviceGroup: filterValues.serviceGroup || undefined,
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
          stage: filterValues.stage || presetStage,
          assignedTo: filterValues.assignedTo || undefined,
          serviceGroup: filterValues.serviceGroup || undefined,
          from: filterValues.from || undefined,
          to: filterValues.to || undefined,
          page,
          size: pageSize,
        });
        setRows(res.rows);
        setMeta(res.meta);
        setSelectedIds([]);
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
  }, [viewMode, debouncedKeyword, filterValues, activePreset, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterFields = useMemo<CrmFilterFieldConfig[]>(
    () => [
      {
        key: 'stage',
        label: 'Giai đoạn',
        type: 'select',
        options: OPPORTUNITY_STAGES,
      },
      {
        key: 'assignedTo',
        label: 'Người thực hiện',
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
        key: 'from',
        toKey: 'to',
        label: 'Ngày tạo',
        type: 'dateRange',
      },
    ],
    [staffList]
  );

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

  const isColVisible = (key: string) => visibleKeys.includes(key);

  return (
    <div className="flex h-full flex-col overflow-hidden px-3 pb-3 pt-2.5 sm:px-4">
      {confirmDialog}

      {/* Sub-header */}
      <div className="mb-2.5 flex min-h-[44px] flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-lg font-semibold text-brand-ink">Cơ hội Hợp đồng</h1>

          {/* View Switcher: Danh sách / KanBan */}
          <div
            role="group"
            aria-label="Chuyển chế độ hiển thị Cơ hội HĐ"
            className="inline-flex rounded-md border border-brand-line bg-white p-0.5"
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                viewMode === 'list'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-ink hover:bg-brand-surface'
              }`}
            >
              <List size={14} aria-hidden="true" />
              <span>Danh sách</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              aria-pressed={viewMode === 'kanban'}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                viewMode === 'kanban'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-ink hover:bg-brand-surface'
              }`}
            >
              <Kanban size={14} aria-hidden="true" />
              <span>KanBan</span>
            </button>
          </div>
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

          {viewMode === 'list' && (
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

              {viewMode === 'list' && (
                <>
                  <CrmColumnPicker
                    columns={OPPORTUNITY_COLUMNS}
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
              {/* 9-column List View */}
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="min-w-[1340px] w-full border-collapse text-left text-xs">
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
                          aria-label="Chọn tất cả Cơ hội HĐ"
                          className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                        />
                      </th>
                      {isColVisible('tags') && <th className="px-3 py-2.5 font-bold">Thẻ</th>}
                      {isColVisible('opportunityName') && (
                        <th className="min-w-[240px] px-3 py-2.5 font-bold">Tên cơ hội</th>
                      )}
                      {isColVisible('contactName') && (
                        <th className="whitespace-nowrap px-3 py-2.5 font-bold">Liên hệ</th>
                      )}
                      {isColVisible('expectedRevenue') && (
                        <th className="whitespace-nowrap px-3 py-2.5 text-right font-bold">
                          Số tiền
                        </th>
                      )}
                      {isColVisible('stage') && (
                        <th className="whitespace-nowrap px-3 py-2.5 font-bold">Giai đoạn</th>
                      )}
                      {isColVisible('expectedCloseDate') && (
                        <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                          Ngày kỳ vọng/kết thúc
                        </th>
                      )}
                      {isColVisible('serviceGroups') && (
                        <th className="whitespace-nowrap px-3 py-2.5 font-bold">Loại hàng hóa</th>
                      )}
                      {isColVisible('assignedUserName') && (
                        <th className="whitespace-nowrap px-3 py-2.5 font-bold">Người thực hiện</th>
                      )}
                      {isColVisible('createdAt') && (
                        <th className="whitespace-nowrap px-3 py-2.5 font-bold">Ngày tạo</th>
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
                          <td colSpan={11} className="px-4 py-3">
                            <div className="h-4 w-full animate-pulse rounded bg-brand-surface" />
                          </td>
                        </tr>
                      ))
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-14 text-center">
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
                        return (
                          <tr
                            key={row.id}
                            onClick={() => setActiveOpp(row)}
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
                                aria-label={`Chọn cơ hội ${row.opportunityName}`}
                                className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                              />
                            </td>

                            {isColVisible('tags') && (
                              <td className="px-3 py-2">
                                <CrmTagList tags={row.tags} />
                              </td>
                            )}

                            {isColVisible('opportunityName') && (
                              <td className="px-3 py-2">
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
                            )}

                            {isColVisible('contactName') && (
                              <td className="px-3 py-2 text-brand-ink">
                                <div>{row.contactName || '—'}</div>
                                {row.contactPhone && (
                                  <div className="text-[11px] tabular-nums text-brand-muted">
                                    {row.contactPhone}
                                  </div>
                                )}
                              </td>
                            )}

                            {isColVisible('expectedRevenue') && (
                              <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-[#065f46]">
                                {formatVnd(row.expectedRevenue)}
                              </td>
                            )}

                            {isColVisible('stage') && (
                              <td className="px-3 py-2">
                                <CrmStatusBadge status={row.stage} />
                              </td>
                            )}

                            {isColVisible('expectedCloseDate') && (
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-ink">
                                {formatDateVi(row.expectedCloseDate)}
                              </td>
                            )}

                            {isColVisible('serviceGroups') && (
                              <td className="max-w-[200px] truncate px-3 py-2 text-brand-ink">
                                {row.serviceGroups?.length ? row.serviceGroups.join(', ') : '—'}
                              </td>
                            )}

                            {isColVisible('assignedUserName') && (
                              <td className="px-3 py-2">
                                <CrmAssigneePill name={row.assignedUserName} />
                              </td>
                            )}

                            {isColVisible('createdAt') && (
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-muted">
                                {formatDateVi(row.createdAt)}
                              </td>
                            )}

                            <td
                              onClick={(e) => e.stopPropagation()}
                              className="sticky right-0 z-10 border-l border-brand-line bg-inherit px-2 py-2"
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
              />
            </>
          )}
        </div>

        {viewMode === 'list' && showActivity && (
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
