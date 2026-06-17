import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import crmService from '../../../../../service/crm';
import { CareAction, CareLog, CareResult, CareStatus, CaseRow, Tag } from '../../../../../types/crm';

interface Props {
  caseRow: CaseRow;
  actions: CareAction[];
  results: CareResult[];
  statuses: CareStatus[];
  tags: Tag[];
  staffName: (id: string | null) => string;
  onClose: () => void;
  onSaved: () => void;
}

export default function CarePopup({
  caseRow,
  actions,
  results,
  statuses,
  tags,
  staffName,
  onClose,
  onSaved,
}: Props) {
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [actionId, setActionId] = useState<number | ''>('');
  const [resultId, setResultId] = useState<number | ''>('');
  const [newStatusId, setNewStatusId] = useState<number | ''>(caseRow.careStatusId ?? '');
  const [followUpAt, setFollowUpAt] = useState('');
  const [note, setNote] = useState('');
  const [addTagIds, setAddTagIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    crmService.careLogs(caseRow.id).then(setLogs).catch(() => undefined);
  }, [caseRow.id]);

  // When a result is picked, apply its suggested status + follow-up requirement.
  const onResultChange = (rid: number | '') => {
    setResultId(rid);
    const r = results.find((x) => x.id === rid);
    if (r?.suggestedStatusId) setNewStatusId(r.suggestedStatusId);
  };

  const requireFollowUp =
    !!results.find((r) => r.id === resultId)?.requireFollowUpDate ||
    !!statuses.find((s) => s.id === newStatusId)?.requireFollowUpDate;

  const save = async () => {
    if (!actionId) return toast.error('Chọn hành động chăm sóc');
    if (requireFollowUp && !followUpAt) return toast.error('Cần nhập ngày hẹn chăm lại');
    setSaving(true);
    try {
      await crmService.recordCare(caseRow.id, {
        actionId: actionId as number,
        resultId: resultId ? (resultId as number) : undefined,
        newStatusId: newStatusId ? (newStatusId as number) : undefined,
        note: note || undefined,
        followUpAt: followUpAt ? new Date(followUpAt).toISOString() : undefined,
        addTagIds: addTagIds.length ? addTagIds : undefined,
      });
      toast.success('Đã ghi nhận chăm sóc');
      onSaved();
      onClose();
    } catch {
      toast.error('Lưu chăm sóc thất bại');
    } finally {
      setSaving(false);
    }
  };

  const statusName = (id: number | null) => statuses.find((s) => s.id === id)?.name ?? '—';
  const actionName = (id: number | null) => actions.find((a) => a.id === id)?.name ?? '—';
  const resultName = (id: number | null) => results.find((r) => r.id === id)?.name ?? '—';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Chăm sóc — {caseRow.serviceName ?? caseRow.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Context */}
        <div className="p-4 bg-gray-50 text-sm grid grid-cols-2 gap-2">
          <div>Email: {caseRow.customerEmail ?? '—'}</div>
          <div>SĐT: {caseRow.customerPhone ?? '—'}</div>
          <div>Trạng thái vụ việc: {caseRow.status ?? '—'}</div>
          <div>Người phụ trách: {staffName(caseRow.assignedUserId)}</div>
        </div>

        {/* History */}
        <div className="p-4 border-b">
          <div className="font-medium mb-2">Lịch sử chăm sóc</div>
          {logs.length === 0 && <div className="text-sm text-gray-400">Chưa có lần chăm sóc nào</div>}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.map((l) => (
              <div key={l.id} className="text-sm border-l-2 border-amber-400 pl-2">
                <div className="text-gray-500">
                  {new Date(l.createdAt).toLocaleString('vi-VN')} · {staffName(l.staffId)}
                </div>
                <div>
                  {actionName(l.actionId)} → {resultName(l.resultId)} · {statusName(l.newStatusId)}
                </div>
                {l.note && <div className="text-gray-600 italic">{l.note}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-3">
          <div className="font-medium">Ghi nhận lần chăm sóc mới</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Hành động *
              <select
                className="w-full border border-brand-line rounded-lg px-3 py-2 mt-1 focus:border-brand-gold outline-none"
                value={actionId}
                onChange={(e) => setActionId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">— chọn —</option>
                {actions.filter((a) => a.active).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Kết quả
              <select
                className="w-full border border-brand-line rounded-lg px-3 py-2 mt-1 focus:border-brand-gold outline-none"
                value={resultId}
                onChange={(e) => onResultChange(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">— chọn —</option>
                {results.filter((r) => r.active).map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Trạng thái chăm sóc mới
              <select
                className="w-full border border-brand-line rounded-lg px-3 py-2 mt-1 focus:border-brand-gold outline-none"
                value={newStatusId}
                onChange={(e) => setNewStatusId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">— giữ nguyên —</option>
                {statuses.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Hẹn chăm lại {requireFollowUp && <span className="text-red-500">*</span>}
              <input
                type="datetime-local"
                className="w-full border border-brand-line rounded-lg px-3 py-2 mt-1 focus:border-brand-gold outline-none"
                value={followUpAt}
                onChange={(e) => setFollowUpAt(e.target.value)}
              />
            </label>
          </div>
          <label className="text-sm block">
            Ghi chú
            <textarea
              className="w-full border border-brand-line rounded-lg px-3 py-2 mt-1 focus:border-brand-gold outline-none"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <div className="text-sm">
            Gắn tag
            <div className="flex flex-wrap gap-2 mt-1">
              {tags.filter((t) => t.active).map((t) => {
                const on = addTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() =>
                      setAddTagIds((prev) =>
                        on ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                      )
                    }
                    className={`px-2 py-0.5 rounded-full text-xs border ${on ? 'text-white' : ''}`}
                    style={on ? { background: t.color, borderColor: t.color } : { borderColor: t.color, color: t.color }}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Hủy</button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded bg-amber-500 text-white disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu chăm sóc'}
          </button>
        </div>
      </div>
    </div>
  );
}
