import { ChevronDown, Mail, Menu, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { contactInfo, menuIconMap, menuItems } from '../../../shared/config/site';
import { ServiceResponse } from '../../../types/service';

const focusClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-goldDark';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    `inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${focusClass}`,
    isActive
      ? 'bg-brand-surface text-brand-goldDark'
      : 'text-gray-700 hover:bg-gray-50 hover:text-brand-goldDark',
  ].join(' ');

function MenuIcon({ id, size = 17 }: { id: string; size?: number }) {
  const Icon = menuIconMap[id as keyof typeof menuIconMap];
  return Icon ? <Icon size={size} aria-hidden="true" /> : null;
}

function DesktopMenuItem({ item }: { item: ServiceResponse }) {
  if (!item.children?.length) {
    return (
      <li>
        <NavLink to={item.href} className={navLinkClass}>
          <MenuIcon id={item.id} />
          <span>{item.title}</span>
        </NavLink>
      </li>
    );
  }

  return (
    <li className="group relative">
      <NavLink to={item.href} className={navLinkClass} aria-haspopup="true">
        <MenuIcon id={item.id} />
        <span>{item.title}</span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className="transition group-hover:rotate-180 group-focus-within:rotate-180"
        />
      </NavLink>
      <div className="invisible absolute left-0 top-full z-50 w-80 translate-y-2 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="mt-2 rounded-lg border border-brand-line bg-white p-2 shadow-soft">
          {item.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.href}
              className={({ isActive }) =>
                [
                  `flex min-h-11 items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors ${focusClass}`,
                  isActive
                    ? 'bg-brand-surface text-brand-goldDark'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-goldDark',
                ].join(' ')
              }
            >
              <span className="text-brand-goldDark">
                <MenuIcon id={child.id} size={16} />
              </span>
              <span>{child.title}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </li>
  );
}

function MobileMenuItem({
  item,
  openSubmenu,
  onToggle,
  onNavigate,
}: {
  item: ServiceResponse;
  openSubmenu: string | null;
  onToggle: (id: string) => void;
  onNavigate: () => void;
}) {
  const isOpen = openSubmenu === item.id;

  return (
    <li>
      <div className="flex items-center gap-2">
        <NavLink
          to={item.href}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              `flex min-h-11 flex-1 items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${focusClass}`,
              isActive ? 'bg-brand-surface text-brand-goldDark' : 'text-gray-800',
            ].join(' ')
          }
        >
          <MenuIcon id={item.id} />
          <span>{item.title}</span>
        </NavLink>
        {!!item.children?.length && (
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            className={`flex h-11 w-11 items-center justify-center rounded-md border border-brand-line text-gray-700 ${focusClass}`}
            aria-label={`${isOpen ? 'Đóng' : 'Mở'} ${item.title}`}
            aria-expanded={isOpen}
          >
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={isOpen ? 'rotate-180 transition' : 'transition'}
            />
          </button>
        )}
      </div>
      {isOpen && item.children?.length && (
        <div className="ml-5 mt-1 space-y-1 border-l border-brand-line pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.href}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  `flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm ${focusClass}`,
                  isActive ? 'bg-brand-surface text-brand-goldDark' : 'text-gray-700',
                ].join(' ')
              }
            >
              <MenuIcon id={child.id} size={15} />
              <span>{child.title}</span>
            </NavLink>
          ))}
        </div>
      )}
    </li>
  );
}

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenSubmenu(null);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line bg-white/95 backdrop-blur">
      <div className="hidden border-b border-white/10 bg-brand-ink text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-sm">
          <div className="flex items-center gap-5">
            <a
              className="inline-flex items-center gap-2 hover:text-brand-gold"
              href={contactInfo.phoneHref}
            >
              <Phone size={14} aria-hidden="true" />
              <span>Hotline: {contactInfo.hotline}</span>
            </a>
            <a
              className="inline-flex items-center gap-2 hover:text-brand-gold"
              href={contactInfo.emailHref}
            >
              <Mail size={14} aria-hidden="true" />
              <span>{contactInfo.email}</span>
            </a>
          </div>
          <span className="text-white/75">Tư vấn sở hữu trí tuệ và pháp lý doanh nghiệp</span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className={`flex shrink-0 items-center ${focusClass}`}
          aria-label="Luật Poip - Trang chủ"
        >
          <img
            src="/assets/images/logo-poip-v2.png"
            alt="Luật Poip"
            width="160"
            height="53"
            className="h-[53px] w-40 object-contain"
          />
        </Link>

        <nav className="hidden lg:block" aria-label="Điều hướng chính">
          <ul className="flex items-center gap-1">
            {menuItems.map((item) => (
              <DesktopMenuItem key={item.id} item={item} />
            ))}
          </ul>
        </nav>

        <a
          href={contactInfo.phoneHref}
          className={`hidden min-h-11 items-center rounded-md bg-brand-goldDark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black lg:inline-flex ${focusClass}`}
        >
          Gọi tư vấn
        </a>

        <button
          type="button"
          onClick={() => setIsMobileOpen((value) => !value)}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-md border border-brand-line text-gray-800 lg:hidden ${focusClass}`}
          aria-label={isMobileOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </div>

      {isMobileOpen && (
        <nav
          id="mobile-navigation"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-brand-line bg-white px-4 py-3 lg:hidden"
          aria-label="Điều hướng di động"
        >
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <MobileMenuItem
                key={item.id}
                item={item}
                openSubmenu={openSubmenu}
                onToggle={(id) => setOpenSubmenu((value) => (value === id ? null : id))}
                onNavigate={() => setIsMobileOpen(false)}
              />
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={contactInfo.phoneHref}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-goldDark px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Gọi ngay
            </a>
            <a
              href={contactInfo.zaloHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-brand-line px-3 py-2 text-center text-sm font-semibold text-gray-800"
            >
              Nhắn Zalo
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
