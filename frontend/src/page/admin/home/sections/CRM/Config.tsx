import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import crmService from '../../../../../service/crm';
import { CareAction, CareResult, CareStatus, Tag } from '../../../../../types/crm';

type TabKey = 'status' | 'action' | 'result' | 'tag';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'status', label: 'Trạng thái chăm sóc' },
  { key: 'action', label: 'Hành động' },
  { key: 'result', label: 'Kết quả' },
  { key: 'tag', label: 'Tag' },
];

export default function CrmConfig() {
  const [tab, setTab] = useState<TabKey>('status');
  const [statuses, setStatuses] = useState<CareStatus[]>([]);
  const [actions, setActions] = useState<CareAction[]>([]);
  const [results, setResults] = useState<CareResult[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const reload = () => {
    crmService.careStatuses().then(setStatuses).catch(() => undefined);
    crmService.careActions().then(setActions).catch(() => undefined);
    crmService.careResults().then(setResults).catch(() => undefined);
    crmService.tags().then(setTags).catch(() => undefined);
  };
  useEffect(reload, []);

  const addStatus = async () => {
    const name = window.prompt('Tên trạng thái chăm sóc?');
    if (!name) return;
    await crmService.saveCareStatus({ name, code: name.toUpperCase().replace(/\s+/g, '_'), color: '#3B82F6', active: true });
    toast.success('Đã thêm'); reload();
  };
  const addAction = async () => {
    const name = window.prompt('Tên hành động?');
    if (!name) return;
    await crmService.saveCareAction({ name, code: name.toUpperCase().replace(/\s+/g, '_'), active: true });
    toast.success('Đã thêm'); reload();
  };
  const addResult = async () => {
    const name = window.prompt('Tên kết quả?');
    if (!name) return;
    await crmService.saveCareResult({ name, code: name.toUpperCase().replace(/\s+/g, '_'), active: true, requireFollowUpDate: false });
    toast.success('Đã thêm'); reload();
  };
  const addTag = async () => {
    const name = window.prompt('Tên tag?');
    if (!name) return;
    await crmService.saveTag({ name, color: '#F59E0B', active: true });
    toast.success('Đã thêm'); reload();
  };

  const toggleStatus = async (s: CareStatus) => { await crmService.saveCareStatus({ ...s, active: !s.active }); reload(); };
  const toggleAction = async (a: CareAction) => { await crmService.saveCareAction({ ...a, active: !a.active }); reload(); };
  const toggleResult = async (r: CareResult) => { await crmService.saveCareResult({ ...r, active: !r.active }); reload(); };
  const toggleTag = async (t: Tag) => { await crmService.saveTag({ ...t, active: !t.active }); reload(); };

  return (
    <div className="bg-white rounded-xl shadow-soft p-4">
      <h2 className="text-lg font-semibold mb-3">Cấu hình chăm sóc</h2>
      <div className="flex gap-2 mb-4 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm ${tab === t.key ? 'border-b-2 border-amber-500 font-medium' : 'text-gray-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'status' && (
        <Section onAdd={addStatus}>
          {statuses.map((s) => (
            <Row key={s.id} color={s.color} name={s.name} sub={s.code} active={s.active} onToggle={() => toggleStatus(s)}
              badges={[s.default && 'mặc định', s.closed && 'kết thúc', s.requireFollowUpDate && 'bắt buộc hẹn'].filter(Boolean) as string[]} />
          ))}
        </Section>
      )}
      {tab === 'action' && (
        <Section onAdd={addAction}>
          {actions.map((a) => (
            <Row key={a.id} name={a.name} sub={a.code} active={a.active} onToggle={() => toggleAction(a)} />
          ))}
        </Section>
      )}
      {tab === 'result' && (
        <Section onAdd={addResult}>
          {results.map((r) => (
            <Row key={r.id} name={r.name} sub={r.code} active={r.active} onToggle={() => toggleResult(r)}
              badges={r.requireFollowUpDate ? ['bắt buộc hẹn'] : []} />
          ))}
        </Section>
      )}
      {tab === 'tag' && (
        <Section onAdd={addTag}>
          {tags.map((t) => (
            <Row key={t.id} color={t.color} name={t.name} active={t.active} onToggle={() => toggleTag(t)} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ onAdd, children }: { onAdd: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onAdd} className="mb-3 flex items-center gap-1 text-sm text-amber-600 hover:underline">
        <Plus size={16} /> Thêm
      </button>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ color, name, sub, active, badges = [], onToggle }: {
  color?: string; name: string; sub?: string; active: boolean; badges?: string[]; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between border rounded px-3 py-2">
      <div className="flex items-center gap-2">
        {color && <span className="w-3 h-3 rounded-full" style={{ background: color }} />}
        <span className={active ? '' : 'line-through text-gray-400'}>{name}</span>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
        {badges.map((b) => (
          <span key={b} className="text-[10px] bg-gray-100 rounded px-1.5">{b}</span>
        ))}
      </div>
      <button onClick={onToggle} className={`text-xs px-2 py-0.5 rounded ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {active ? 'Bật' : 'Tắt'}
      </button>
    </div>
  );
}
