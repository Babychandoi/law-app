import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';
import type { NavGroup } from '../../page/admin/home/navConfig';

/**
 * Bảng lệnh điều hướng nhanh (⌘/Ctrl+K) cho khu quản trị.
 * - Mở bằng ⌘K (macOS) / Ctrl+K; đóng bằng Escape hoặc click nền.
 * - Gõ để lọc, ↑/↓ chọn, Enter điều hướng.
 * - A11y: role=dialog + aria-modal, listbox/option, aria-activedescendant, focus trap tối thiểu.
 */

interface Cmd {
  label: string;
  path: string;
  group: string;
  Icon: NavGroup['items'][number]['icon'];
}

export default function CommandPalette({ groups }: { groups: NavGroup[] }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const commands = useMemo<Cmd[]>(
    () =>
      groups.flatMap((g) =>
        g.items.map((it) => ({ label: it.label, path: it.path, group: g.title, Icon: it.icon }))
      ),
    [groups]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Mở/đóng bằng ⌘K / Ctrl+K toàn cục; hoặc mở qua sự kiện tuỳ biến (nút trên Navbar).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen);
    };
  }, []);

  // Khi mở: reset truy vấn, đưa focus vào ô nhập.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // đợi render xong mới focus
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Giữ mục đang chọn trong tầm nhìn.
  useEffect(() => {
    if (active >= results.length) setActive(0);
  }, [results, active]);

  const close = useCallback(() => setOpen(false), []);
  const go = useCallback(
    (path: string) => {
      close();
      navigate(path);
    },
    [close, navigate]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = results[active];
      if (chosen) go(chosen.path);
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`#cmd-opt-${active}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bảng lệnh điều hướng nhanh"
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-gray-100 px-3">
          <Search size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Tìm màn hình… (↑/↓ chọn, Enter mở, Esc đóng)"
            aria-label="Tìm màn hình để điều hướng"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-listbox"
            aria-activedescendant={results[active] ? `cmd-opt-${active}` : undefined}
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        <ul
          id="cmd-listbox"
          ref={listRef}
          role="listbox"
          aria-label="Kết quả"
          className="max-h-80 overflow-y-auto p-1"
        >
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-gray-500">Không có kết quả</li>
          )}
          {results.map((c, i) => {
            const Icon = c.Icon;
            return (
              <li
                key={c.path}
                id={`cmd-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(c.path)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  i === active ? 'bg-brand-surface text-brand-ink' : 'text-gray-700'
                }`}
              >
                <Icon size={16} className="shrink-0 text-brand-goldDark" aria-hidden="true" />
                <span className="flex-1">{c.label}</span>
                <span className="text-xs text-gray-400">{c.group}</span>
                {i === active && (
                  <CornerDownLeft size={14} className="text-gray-400" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
