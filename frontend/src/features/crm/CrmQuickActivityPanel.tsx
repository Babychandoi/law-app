import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, CheckCircle2, CheckSquare, Circle, Mail, Phone, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import crmEnterpriseApi from './api';
import { formatDateTimeVi, formatStaffActor } from './formatters';
import type { CrmActivityDto, CrmActivityType, CrmEntityType, StaffUser } from './types';

export interface CrmQuickActivityPanelProps {
  entityType: CrmEntityType;
  entityId?: string | null;
  entityLabel?: string;
  entityPhone?: string | null;
  docked?: boolean;
  onClose?: () => void;
}

const ACTION_BUTTONS: {
  type: CrmActivityType;
  label: string;
  defaultTitle: string;
  Icon: typeof Phone;
}[] = [
  { type: 'CALL', label: 'Gọi điện', defaultTitle: 'Gọi điện tư vấn KH', Icon: Phone },
  { type: 'TASK', label: 'Nhiệm vụ', defaultTitle: 'Nhiệm vụ chăm sóc hồ sơ', Icon: CheckSquare },
  { type: 'MEETING', label: 'Lịch hẹn', defaultTitle: 'Lịch hẹn tư vấn pháp lý', Icon: Calendar },
  { type: 'EMAIL', label: 'Email/Ghi chú', defaultTitle: 'Ghi chú trao đổi KH', Icon: Mail },
];

export default function CrmQuickActivityPanel({
  entityType,
  entityId,
  entityLabel,
  entityPhone,
  docked = false,
  onClose,
}: CrmQuickActivityPanelProps) {
  const outletCtx = useOutletContext<
    | {
        me?: { fullName?: string | null; username?: string | null } | null;
        staffList?: StaffUser[];
      }
    | undefined
  >();
  const staffList = outletCtx?.staffList;
  const actorDisplayName = outletCtx?.me?.fullName || outletCtx?.me?.username || undefined;
  const [activities, setActivities] = useState<CrmActivityDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [composerType, setComposerType] = useState<CrmActivityType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [saving, setSaving] = useState(false);

  const loadActivities = useCallback(async () => {
    if (!entityId) {
      setActivities([]);
      return;
    }
    setLoading(true);
    try {
      const list = await crmEnterpriseApi.listActivities(entityType, entityId);
      setActivities(list);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && composerType) {
        setComposerType(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [composerType]);

  const openComposer = (btn: (typeof ACTION_BUTTONS)[number]) => {
    setComposerType(btn.type);
    setTitle(btn.defaultTitle);
    setContent('');
    setDueAt('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId || !composerType || !title.trim()) return;
    setSaving(true);
    try {
      await crmEnterpriseApi.createActivity({
        entityType,
        entityId,
        activityType: composerType,
        title: title.trim(),
        content: content.trim() || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        createdByName: actorDisplayName,
      });
      toast.success('Đã lưu hoạt động chăm sóc');
      setComposerType(null);
      setTitle('');
      setContent('');
      setDueAt('');
      await loadActivities();
    } catch {
      toast.error('Không thể lưu hoạt động. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (activity: CrmActivityDto) => {
    try {
      await crmEnterpriseApi.toggleActivityComplete(activity.id);
      await loadActivities();
    } catch {
      toast.error('Không thể cập nhật trạng thái hoạt động');
    }
  };

  const handleDelete = async (activityId: string) => {
    try {
      await crmEnterpriseApi.deleteActivity(activityId);
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
      toast.success('Đã xóa hoạt động');
    } catch {
      toast.error('Không thể xóa hoạt động');
    }
  };

  const containerClass = docked
    ? 'flex h-full w-[280px] shrink-0 flex-col rounded-lg border border-brand-line bg-white'
    : 'flex flex-col rounded-lg border border-brand-line bg-white';

  return (
    <section aria-label="Hoạt động và lịch sử giao dịch" className={containerClass}>
      <div className="flex items-center justify-between border-b border-brand-line px-3.5 py-2.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-brand-ink">
            {entityLabel ? `Hoạt động · ${entityLabel}` : 'Hoạt động & Lịch sử'}
          </h3>
          {entityPhone && (
            <a
              href={`tel:${entityPhone}`}
              className="text-xs font-medium tabular-nums text-brand-primary hover:underline"
            >
              {entityPhone}
            </a>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng khung hoạt động"
            className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {!entityId ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-brand-muted">
          Chọn một bản ghi trên bảng để xem nhanh lịch sử tương tác hoặc ghi nhận cuộc gọi, lịch
          hẹn.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-1.5 border-b border-brand-line bg-brand-surface/60 px-3 py-3">
            {ACTION_BUTTONS.map((btn) => {
              const Icon = btn.Icon;
              const isSelected = composerType === btn.type;
              return (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => openComposer(btn)}
                  aria-label={btn.label}
                  aria-pressed={isSelected}
                  className="group flex flex-col items-center gap-1 rounded-lg p-1.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-brand-line bg-white text-brand-primary group-hover:border-brand-primary'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-brand-ink">
                    {btn.label}
                  </span>
                </button>
              );
            })}
          </div>

          {composerType && (
            <form
              onSubmit={handleSubmit}
              className="space-y-2.5 border-b border-brand-line bg-brand-surface/40 p-3"
            >
              <div>
                <label
                  htmlFor={`act-title-${entityId}`}
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Tiêu đề hoạt động *
                </label>
                <input
                  id={`act-title-${entityId}`}
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
              <div>
                <label
                  htmlFor={`act-content-${entityId}`}
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Nội dung trao đổi
                </label>
                <textarea
                  id={`act-content-${entityId}`}
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ghi tóm tắt kết quả cuộc gọi, yêu cầu của khách hàng..."
                  className="w-full rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
              <div>
                <label
                  htmlFor={`act-due-${entityId}`}
                  className="mb-1 block text-xs font-semibold text-brand-ink"
                >
                  Hạn thực hiện / Lịch hẹn lại
                </label>
                <input
                  id={`act-due-${entityId}`}
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setComposerType(null)}
                  className="rounded-md border border-brand-line bg-white px-2.5 py-1 text-xs font-medium text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-brand-primary px-3 py-1 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {saving ? 'Đang lưu...' : 'Lưu hoạt động'}
                </button>
              </div>
            </form>
          )}

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {loading ? (
              <div className="space-y-2" aria-label="Đang tải hoạt động">
                <div className="h-14 animate-pulse rounded-md bg-brand-surface" />
                <div className="h-14 animate-pulse rounded-md bg-brand-surface" />
              </div>
            ) : activities.length === 0 ? (
              <p className="py-6 text-center text-xs text-brand-muted">
                Chưa có lịch sử hoạt động nào. Nhấn biểu tượng ở trên để thêm cuộc gọi hoặc ghi chú
                đầu tiên.
              </p>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="rounded-md border border-brand-line bg-white p-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(act)}
                      aria-label={
                        act.completed
                          ? `Đánh dấu chưa hoàn thành: ${act.title}`
                          : `Đánh dấu hoàn thành: ${act.title}`
                      }
                      className="mt-0.5 flex items-start gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      {act.completed ? (
                        <CheckCircle2
                          size={15}
                          className="mt-0.5 shrink-0 text-[#065f46]"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle
                          size={15}
                          className="mt-0.5 shrink-0 text-brand-muted"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={`font-semibold ${
                          act.completed ? 'text-brand-muted line-through' : 'text-brand-ink'
                        }`}
                      >
                        {act.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(act.id)}
                      aria-label={`Xóa hoạt động ${act.title}`}
                      className="rounded p-1 text-brand-muted hover:bg-[#ffe4e6] hover:text-[#9f1239] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                  {act.content && (
                    <p className="mt-1 whitespace-pre-line pl-5 text-brand-muted">{act.content}</p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 pl-5 text-[11px] tabular-nums text-brand-muted">
                    <span>{formatStaffActor(act.createdByName, staffList, 'Chuyên viên')}</span>
                    <span>
                      {act.dueAt
                        ? `Hẹn: ${formatDateTimeVi(act.dueAt)}`
                        : formatDateTimeVi(act.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
