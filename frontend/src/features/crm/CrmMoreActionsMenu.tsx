import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArchiveRestore,
  Clock,
  MoreHorizontal,
  Printer,
  RotateCcw,
  Share2,
  Tag,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import crmEnterpriseApi from './api';
import type { CrmQuickStatGroup } from './CrmFilterPanel';
import { formatDateVi, formatVnd } from './formatters';
import type { CrmModuleEndpoint, StaffUser } from './types';

export interface CrmActionRecordSummary {
  id: string;
  code: string;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  assignedUserName?: string | null;
  amount?: number | null;
  updatedAt?: string | null;
}

export interface CrmMoreActionsMenuProps {
  moduleEndpoint: CrmModuleEndpoint;
  moduleLabel: string;
  records: CrmActionRecordSummary[];
  selectedIds: string[];
  staffList: StaffUser[];
  quickStats: CrmQuickStatGroup[];
  fetchDeletedRecords: () => Promise<CrmActionRecordSummary[]>;
  onReload: () => void;
}

type ActiveModal = 'none' | 'stats' | 'handover' | 'delete' | 'share' | 'tags' | 'recycle';

const SUGGESTED_TAGS = ['VIP', 'Gấp', 'SHTT', 'Doanh nghiệp', 'Tái ký', 'Công nợ'];

export default function CrmMoreActionsMenu({
  moduleEndpoint,
  moduleLabel,
  records,
  selectedIds,
  staffList,
  quickStats,
  fetchDeletedRecords,
  onReload,
}: CrmMoreActionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ActiveModal>('none');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [assigneeId, setAssigneeId] = useState('');
  const [shareAction, setShareAction] = useState<'SHARE' | 'UNSHARE'>('SHARE');
  const [tagAction, setTagAction] = useState<'ADD_TAG' | 'REMOVE_TAG'>('ADD_TAG');
  const [tagValue, setTagValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Recycle bin state
  const [deletedRows, setDeletedRows] = useState<CrmActionRecordSummary[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [selectedDeletedIds, setSelectedDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (modal === 'none') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModal('none');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal]);

  const loadDeleted = useCallback(async () => {
    setLoadingDeleted(true);
    try {
      const items = await fetchDeletedRecords();
      setDeletedRows(items);
      setSelectedDeletedIds([]);
    } catch {
      toast.error(`Không tải được Thùng rác ${moduleLabel}`);
    } finally {
      setLoadingDeleted(false);
    }
  }, [fetchDeletedRecords, moduleLabel]);

  const openModalWithSelection = (nextModal: ActiveModal) => {
    setMenuOpen(false);
    setTargetIds(selectedIds.length > 0 ? selectedIds : records.slice(0, 1).map((r) => r.id));
    if (staffList.length > 0 && !assigneeId) {
      setAssigneeId(staffList[0].id);
    }
    setModal(nextModal);
    if (nextModal === 'recycle') {
      loadDeleted();
    }
  };

  const toggleTargetId = (id: string) => {
    setTargetIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkHandover = async () => {
    if (targetIds.length === 0) {
      toast.info('Vui lòng chọn ít nhất 1 bản ghi để bàn giao');
      return;
    }
    const staff = staffList.find((u) => u.id === assigneeId);
    if (!staff) {
      toast.error('Vui lòng chọn nhân sự nhận bàn giao');
      return;
    }
    setSubmitting(true);
    try {
      await crmEnterpriseApi.bulkAction(moduleEndpoint, {
        ids: targetIds,
        action: 'ASSIGN',
        assignedUserId: staff.id,
        assignedUserName: staff.fullName || staff.username,
      });
      toast.success(
        `Đã bàn giao ${targetIds.length} ${moduleLabel} cho ${staff.fullName || staff.username}`
      );
      setModal('none');
      onReload();
    } catch {
      toast.error('Không thể thực hiện bàn giao công việc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSoftDelete = async () => {
    if (targetIds.length === 0) {
      toast.info('Vui lòng chọn ít nhất 1 bản ghi để xóa');
      return;
    }
    setSubmitting(true);
    try {
      await crmEnterpriseApi.bulkAction(moduleEndpoint, {
        ids: targetIds,
        action: 'DELETE',
      });
      toast.success(`Đã chuyển ${targetIds.length} ${moduleLabel} vào Thùng rác`);
      setModal('none');
      onReload();
    } catch {
      toast.error('Không thể xóa hàng loạt bản ghi đã chọn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkShare = async () => {
    if (targetIds.length === 0) {
      toast.info('Vui lòng chọn ít nhất 1 bản ghi');
      return;
    }
    setSubmitting(true);
    try {
      await crmEnterpriseApi.bulkAction(moduleEndpoint, {
        ids: targetIds,
        action: shareAction,
      });
      toast.success(
        shareAction === 'SHARE'
          ? `Đã bật Dùng chung cho ${targetIds.length} ${moduleLabel}`
          : `Đã tắt Dùng chung cho ${targetIds.length} ${moduleLabel}`
      );
      setModal('none');
      onReload();
    } catch {
      toast.error('Không thể cập nhật thiết lập chia sẻ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkTag = async () => {
    const cleanTag = tagValue.trim();
    if (targetIds.length === 0 || !cleanTag) {
      toast.info('Vui lòng chọn bản ghi và nhập tên thẻ');
      return;
    }
    setSubmitting(true);
    try {
      await crmEnterpriseApi.bulkAction(moduleEndpoint, {
        ids: targetIds,
        action: tagAction,
        tag: cleanTag,
      });
      toast.success(
        tagAction === 'ADD_TAG'
          ? `Đã gắn thẻ "${cleanTag}" cho ${targetIds.length} bản ghi`
          : `Đã gỡ thẻ "${cleanTag}" khỏi ${targetIds.length} bản ghi`
      );
      setTagValue('');
      setModal('none');
      onReload();
    } catch {
      toast.error('Không thể cập nhật thẻ hàng loạt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreSingle = async (id: string) => {
    try {
      await crmEnterpriseApi.restoreRecord(moduleEndpoint, id);
      toast.success(`Đã khôi phục ${moduleLabel}`);
      await loadDeleted();
      onReload();
    } catch {
      toast.error('Không thể khôi phục bản ghi');
    }
  };

  const handleBulkRestore = async () => {
    if (selectedDeletedIds.length === 0) return;
    setSubmitting(true);
    try {
      await crmEnterpriseApi.bulkAction(moduleEndpoint, {
        ids: selectedDeletedIds,
        action: 'RESTORE',
      });
      toast.success(`Đã khôi phục ${selectedDeletedIds.length} ${moduleLabel}`);
      await loadDeleted();
      onReload();
    } catch {
      toast.error('Không thể khôi phục hàng loạt');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await crmEnterpriseApi.permanentDeleteRecord(moduleEndpoint, id);
      toast.success('Đã xóa vĩnh viễn bản ghi');
      await loadDeleted();
    } catch {
      toast.error('Không thể xóa vĩnh viễn bản ghi');
    }
  };

  const renderRecordPicker = () => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-brand-ink">
          Bản ghi áp dụng (<span className="tabular-nums">{targetIds.length}</span>)
        </span>
        <button
          type="button"
          onClick={() =>
            setTargetIds(targetIds.length === records.length ? [] : records.map((r) => r.id))
          }
          className="font-semibold text-brand-primary hover:underline"
        >
          {targetIds.length === records.length ? 'Bỏ chọn hết' : 'Chọn tất cả trên trang'}
        </button>
      </div>
      <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border border-brand-line bg-brand-surface/40 p-2">
        {records.length === 0 ? (
          <div className="py-3 text-center text-xs text-brand-muted">
            Không có bản ghi nào trên trang hiện tại
          </div>
        ) : (
          records.map((rec) => (
            <label
              key={rec.id}
              className="flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1 text-xs text-brand-ink hover:bg-white"
            >
              <span className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={targetIds.includes(rec.id)}
                  onChange={() => toggleTargetId(rec.id)}
                  aria-label={`Chọn ${rec.title}`}
                  className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                />
                <span className="truncate font-medium">{rec.title}</span>
              </span>
              <span className="shrink-0 tabular-nums text-[11px] text-brand-muted">{rec.code}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Thao tác mở rộng"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        title="Thao tác mở rộng"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          aria-label={`Tiện ích mở rộng ${moduleLabel}`}
          className="absolute right-0 top-full z-40 mt-1.5 w-52 rounded-lg border border-brand-line bg-white py-1.5 shadow-soft"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => openModalWithSelection('stats')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-brand-ink hover:bg-brand-surface"
          >
            <Clock size={14} className="text-brand-muted" aria-hidden="true" />
            <span>Thống kê nhanh</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => openModalWithSelection('handover')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-brand-ink hover:bg-brand-surface"
          >
            <UserCheck size={14} className="text-brand-muted" aria-hidden="true" />
            <span>Bàn giao công việc</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => openModalWithSelection('delete')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-brand-ink hover:bg-brand-surface"
          >
            <Trash2 size={14} className="text-brand-muted" aria-hidden="true" />
            <span>Xóa hàng loạt</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => openModalWithSelection('share')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-brand-ink hover:bg-brand-surface"
          >
            <Share2 size={14} className="text-brand-muted" aria-hidden="true" />
            <span>Quản lý chia sẻ</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => openModalWithSelection('tags')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-brand-ink hover:bg-brand-surface"
          >
            <Tag size={14} className="text-brand-muted" aria-hidden="true" />
            <span>Quản lý thẻ</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              window.print();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-brand-ink hover:bg-brand-surface"
          >
            <Printer size={14} className="text-brand-muted" aria-hidden="true" />
            <span>In</span>
          </button>

          <div className="my-1 border-t border-brand-line" />

          <button
            type="button"
            role="menuitem"
            onClick={() => openModalWithSelection('recycle')}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-brand-ink hover:bg-brand-surface"
          >
            <ArchiveRestore size={14} className="text-brand-muted" aria-hidden="true" />
            <span>Thùng rác</span>
          </button>
        </div>
      )}

      {/* 1. Thống kê nhanh Modal */}
      {modal === 'stats' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Thống kê nhanh ${moduleLabel}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-4"
        >
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-brand-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5">
              <h2 className="text-base font-bold text-brand-ink">Thống kê nhanh — {moduleLabel}</h2>
              <button
                type="button"
                onClick={() => setModal('none')}
                aria-label="Đóng thống kê nhanh"
                className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-5 md:grid-cols-3">
              {quickStats.map((group) => {
                const total = group.items.reduce((s, r) => s + r.count, 0);
                return (
                  <div
                    key={group.title}
                    className="space-y-3 rounded-lg border border-brand-line bg-white p-4"
                  >
                    <div className="border-b border-brand-line pb-2 text-xs font-bold text-brand-ink">
                      {group.title}
                    </div>
                    {group.items.length === 0 ? (
                      <p className="text-xs text-brand-muted">Chưa có dữ liệu</p>
                    ) : (
                      <div className="space-y-2.5">
                        {group.items.map((row) => {
                          const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
                          return (
                            <div key={row.label} className="space-y-1">
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate font-medium text-brand-ink">
                                  {row.label}
                                </span>
                                <span className="shrink-0 font-bold tabular-nums text-brand-ink">
                                  {row.count} ({pct}%)
                                </span>
                              </div>
                              {row.amount !== undefined && row.amount > 0 && (
                                <div className="text-[11px] font-medium tabular-nums text-[#065f46]">
                                  {formatVnd(row.amount, true)}
                                </div>
                              )}
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-surface">
                                <div
                                  className="h-full rounded-full bg-brand-primary"
                                  style={{ width: `${Math.max(pct, row.count > 0 ? 4 : 0)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Bàn giao công việc Modal */}
      {modal === 'handover' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bàn giao công việc"
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-4"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-brand-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5">
              <h2 className="text-base font-bold text-brand-ink">
                Bàn giao công việc ({moduleLabel})
              </h2>
              <button
                type="button"
                onClick={() => setModal('none')}
                aria-label="Đóng bàn giao công việc"
                className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {renderRecordPicker()}
              <div>
                <label
                  htmlFor="crm-handover-staff"
                  className="mb-1.5 block text-xs font-semibold text-brand-ink"
                >
                  Người phụ trách tiếp nhận
                </label>
                <select
                  id="crm-handover-staff"
                  aria-label="Người phụ trách tiếp nhận"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="h-9 w-full rounded-md border border-brand-line bg-white px-3 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="">-- Chọn nhân sự --</option>
                  {staffList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-brand-line bg-brand-surface/50 px-5 py-3">
              <button
                type="button"
                onClick={() => setModal('none')}
                className="h-8 rounded-md border border-brand-line bg-white px-3.5 text-xs font-semibold text-brand-ink hover:bg-brand-surface"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={submitting || targetIds.length === 0 || !assigneeId}
                onClick={handleBulkHandover}
                className="h-8 rounded-md bg-brand-primary px-4 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-50"
              >
                {submitting ? 'Đang bàn giao...' : 'Bàn giao ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Xóa hàng loạt Modal */}
      {modal === 'delete' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xóa hàng loạt"
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-4"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-brand-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5">
              <h2 className="text-base font-bold text-brand-ink">Xóa hàng loạt ({moduleLabel})</h2>
              <button
                type="button"
                onClick={() => setModal('none')}
                aria-label="Đóng xóa hàng loạt"
                className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-xs text-brand-muted">
                Các bản ghi được chọn sẽ được chuyển vào <strong>Thùng rác</strong> và có thể khôi
                phục lại khi cần.
              </p>
              {renderRecordPicker()}
            </div>
            <div className="flex justify-end gap-2 border-t border-brand-line bg-brand-surface/50 px-5 py-3">
              <button
                type="button"
                onClick={() => setModal('none')}
                className="h-8 rounded-md border border-brand-line bg-white px-3.5 text-xs font-semibold text-brand-ink hover:bg-brand-surface"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={submitting || targetIds.length === 0}
                onClick={handleBulkSoftDelete}
                className="h-8 rounded-md bg-[#9f1239] px-4 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Đang chuyển...' : `Chuyển ${targetIds.length} bản ghi vào Thùng rác`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Quản lý chia sẻ Modal */}
      {modal === 'share' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quản lý chia sẻ"
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-4"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-brand-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5">
              <h2 className="text-base font-bold text-brand-ink">
                Quản lý chia sẻ ({moduleLabel})
              </h2>
              <button
                type="button"
                onClick={() => setModal('none')}
                aria-label="Đóng quản lý chia sẻ"
                className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {renderRecordPicker()}
              <div className="flex items-center gap-5 text-xs">
                <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-brand-ink">
                  <input
                    type="radio"
                    name="crm-share-mode"
                    checked={shareAction === 'SHARE'}
                    onChange={() => setShareAction('SHARE')}
                    aria-label="Bật chia sẻ dùng chung"
                    className="h-4 w-4 border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Bật Dùng chung toàn đơn vị</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-brand-ink">
                  <input
                    type="radio"
                    name="crm-share-mode"
                    checked={shareAction === 'UNSHARE'}
                    onChange={() => setShareAction('UNSHARE')}
                    aria-label="Tắt chia sẻ dùng chung"
                    className="h-4 w-4 border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Hủy Dùng chung</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-brand-line bg-brand-surface/50 px-5 py-3">
              <button
                type="button"
                onClick={() => setModal('none')}
                className="h-8 rounded-md border border-brand-line bg-white px-3.5 text-xs font-semibold text-brand-ink hover:bg-brand-surface"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={submitting || targetIds.length === 0}
                onClick={handleBulkShare}
                className="h-8 rounded-md bg-brand-primary px-4 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-50"
              >
                {submitting ? 'Đang cập nhật...' : 'Áp dụng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Quản lý thẻ Modal */}
      {modal === 'tags' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quản lý thẻ"
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-4"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-brand-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5">
              <h2 className="text-base font-bold text-brand-ink">Quản lý thẻ ({moduleLabel})</h2>
              <button
                type="button"
                onClick={() => setModal('none')}
                aria-label="Đóng quản lý thẻ"
                className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {renderRecordPicker()}
              <div className="flex items-center gap-5 text-xs">
                <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-brand-ink">
                  <input
                    type="radio"
                    name="crm-tag-mode"
                    checked={tagAction === 'ADD_TAG'}
                    onChange={() => setTagAction('ADD_TAG')}
                    aria-label="Gắn thêm thẻ"
                    className="h-4 w-4 border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Gắn thêm thẻ</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-brand-ink">
                  <input
                    type="radio"
                    name="crm-tag-mode"
                    checked={tagAction === 'REMOVE_TAG'}
                    onChange={() => setTagAction('REMOVE_TAG')}
                    aria-label="Gỡ bỏ thẻ"
                    className="h-4 w-4 border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Gỡ bỏ thẻ</span>
                </label>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  aria-label="Tên thẻ"
                  placeholder="Nhập nhãn thẻ (VD: VIP, Gấp, SHTT)..."
                  value={tagValue}
                  onChange={(e) => setTagValue(e.target.value)}
                  className="h-9 w-full rounded-md border border-brand-line bg-white px-3 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTagValue(t)}
                      className="rounded bg-brand-accentSoft px-2 py-0.5 text-[11px] font-medium text-brand-ink hover:bg-brand-accent/40"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-brand-line bg-brand-surface/50 px-5 py-3">
              <button
                type="button"
                onClick={() => setModal('none')}
                className="h-8 rounded-md border border-brand-line bg-white px-3.5 text-xs font-semibold text-brand-ink hover:bg-brand-surface"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={submitting || targetIds.length === 0 || !tagValue.trim()}
                onClick={handleBulkTag}
                className="h-8 rounded-md bg-brand-primary px-4 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-50"
              >
                {submitting ? 'Đang lưu...' : 'Cập nhật thẻ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Thùng rác Modal */}
      {modal === 'recycle' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Thùng rác ${moduleLabel}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-4"
        >
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-brand-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <ArchiveRestore size={17} className="text-brand-primary" aria-hidden="true" />
                <h2 className="text-base font-bold text-brand-ink">Thùng rác — {moduleLabel}</h2>
                <span className="rounded-full bg-brand-surface px-2 py-0.5 text-xs font-bold tabular-nums text-brand-primary">
                  {deletedRows.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedDeletedIds.length > 0 && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleBulkRestore}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3 text-xs font-semibold text-white hover:bg-brand-primaryDark"
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    <span>Khôi phục ({selectedDeletedIds.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModal('none')}
                  aria-label="Đóng thùng rác"
                  className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 border-b border-brand-line bg-brand-surface text-brand-ink">
                  <tr>
                    <th className="w-10 px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={
                          deletedRows.length > 0 && selectedDeletedIds.length === deletedRows.length
                        }
                        onChange={() =>
                          setSelectedDeletedIds(
                            selectedDeletedIds.length === deletedRows.length
                              ? []
                              : deletedRows.map((r) => r.id)
                          )
                        }
                        aria-label="Chọn tất cả bản ghi trong thùng rác"
                        className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                      />
                    </th>
                    <th className="px-3 py-2.5 font-bold">Mã</th>
                    <th className="px-3 py-2.5 font-bold">Tên bản ghi</th>
                    <th className="px-3 py-2.5 font-bold">Trạng thái</th>
                    <th className="px-3 py-2.5 font-bold">Người phụ trách</th>
                    <th className="px-3 py-2.5 font-bold">Cập nhật</th>
                    <th className="px-3 py-2.5 text-right font-bold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {loadingDeleted ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-brand-muted">
                        Đang tải dữ liệu Thùng rác...
                      </td>
                    </tr>
                  ) : deletedRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-brand-muted">
                        Thùng rác trống.
                      </td>
                    </tr>
                  ) : (
                    deletedRows.map((item) => (
                      <tr key={item.id} className="hover:bg-brand-surface/50">
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedDeletedIds.includes(item.id)}
                            onChange={() =>
                              setSelectedDeletedIds((prev) =>
                                prev.includes(item.id)
                                  ? prev.filter((x) => x !== item.id)
                                  : [...prev, item.id]
                              )
                            }
                            aria-label={`Chọn khôi phục ${item.title}`}
                            className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-semibold tabular-nums text-brand-ink">
                          {item.code}
                        </td>
                        <td className="px-3 py-2 font-medium text-brand-ink">
                          <div>{item.title}</div>
                          {item.subtitle && (
                            <div className="text-[11px] text-brand-muted">{item.subtitle}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-brand-muted">{item.status || '—'}</td>
                        <td className="px-3 py-2 text-brand-muted">
                          {item.assignedUserName || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums text-brand-muted">
                          {formatDateVi(item.updatedAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestoreSingle(item.id)}
                              className="inline-flex items-center gap-1 rounded border border-brand-line bg-white px-2.5 py-1 font-semibold text-brand-primary hover:bg-brand-surface"
                            >
                              <RotateCcw size={12} aria-hidden="true" />
                              <span>Khôi phục</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentDelete(item.id)}
                              className="inline-flex items-center gap-1 rounded border border-brand-line bg-white px-2.5 py-1 font-semibold text-[#9f1239] hover:bg-[#ffe4e6]"
                            >
                              <Trash2 size={12} aria-hidden="true" />
                              <span>Xóa vĩnh viễn</span>
                            </button>
                          </div>
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
    </div>
  );
}
