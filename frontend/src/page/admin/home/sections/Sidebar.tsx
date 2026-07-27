import { X, type LucideIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import type { NavGroup } from '../navConfig';

interface FooterLink {
  label: string;
  to: string;
  icon?: LucideIcon;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold',
    isActive
      ? 'bg-brand-gold/20 text-brand-gold'
      : 'text-white/70 hover:bg-white/10 hover:text-white',
  ].join(' ');

function NavContent({
  groups,
  footer,
  onNavigate,
}: {
  groups: NavGroup[];
  footer?: FooterLink;
  onNavigate?: () => void;
}) {
  return (
    <nav
      className="flex flex-1 flex-col overflow-y-auto px-3 py-4"
      aria-label="Điều hướng quản trị"
    >
      <div className="flex-1 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/70">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onNavigate}
                  className={linkClass}
                >
                  <item.icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {footer && (
        <NavLink
          to={footer.to}
          onClick={onNavigate}
          className="mt-6 flex items-center gap-3 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
        >
          {footer.icon && <footer.icon size={18} aria-hidden="true" />}
          <span>{footer.label}</span>
        </NavLink>
      )}
    </nav>
  );
}

const Sidebar: React.FC<{
  groups: NavGroup[];
  footer?: FooterLink;
  workspaceTitle?: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}> = ({ groups, footer, workspaceTitle = 'Admin', sidebarOpen, setSidebarOpen }) => {
  const drawerRef = useRef<HTMLElement>(null);
  // Nút vừa mở drawer (thường là "Mở menu") — để trả focus về đúng chỗ khi đóng.
  const openerRef = useRef<HTMLElement | null>(null);

  // Khi drawer mở: khóa nền (inert) để không tab ra ngoài; khi đóng: trả focus về nút mở.
  useEffect(() => {
    const content = document.getElementById('admin-content-region');
    if (sidebarOpen) {
      openerRef.current = document.activeElement as HTMLElement | null;
      content?.setAttribute('inert', '');
    } else {
      content?.removeAttribute('inert');
      openerRef.current?.focus?.();
      openerRef.current = null;
    }
    return () => content?.removeAttribute('inert');
  }, [sidebarOpen]);

  // Khi drawer mở: đưa focus vào drawer, bẫy Tab bên trong, đóng bằng Escape.
  useEffect(() => {
    if (!sidebarOpen) return;
    const el = drawerRef.current;
    const focusables = () =>
      Array.from(
        el?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((x) => x.offsetParent !== null);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen, setSidebarOpen]);

  // Khi drawer đóng (trượt khỏi màn hình), đặt `inert` để link bên trong không nhận
  // focus/tab (aria-hidden thôi chưa đủ — vẫn tab được vào phần tử ngoài màn hình).
  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    if (sidebarOpen) el.removeAttribute('inert');
    else el.setAttribute('inert', '');
  }, [sidebarOpen]);

  const brand = (onClose?: () => void) => (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white">Luật Poip</span>
        <span className="rounded bg-brand-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-gold">
          {workspaceTitle}
        </span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Đóng menu"
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: sidebar cố định */}
      <aside className="hidden w-60 shrink-0 flex-col bg-brand-ink lg:flex">
        {brand()}
        <NavContent groups={groups} footer={footer} />
      </aside>

      {/* Mobile: drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-ink shadow-xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu quản trị"
      >
        {brand(() => setSidebarOpen(false))}
        <NavContent groups={groups} footer={footer} onNavigate={() => setSidebarOpen(false)} />
      </aside>
    </>
  );
};

export default Sidebar;
