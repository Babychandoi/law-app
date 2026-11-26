import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Pin, Plus, Star } from 'lucide-react';
import type { CrmSavedView } from './viewConfigs';

export interface CrmViewSelectorProps {
  views: CrmSavedView[];
  activeView: CrmSavedView;
  pinnedViewId: string;
  onSelectView: (view: CrmSavedView) => void;
  onToggleFavorite: (viewId: string) => void;
  onPinView: (viewId: string) => void;
  onEditView: () => void;
  onCreateView: () => void;
}

export default function CrmViewSelector({
  views,
  activeView,
  pinnedViewId,
  onSelectView,
  onToggleFavorite,
  onPinView,
  onEditView,
  onCreateView,
}: CrmViewSelectorProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const favoriteViews = views.filter((v) => v.favorite);
  const sharedViews = views.filter((v) => !v.favorite && v.section === 'SHARED');
  const myViews = views.filter((v) => !v.favorite && v.section !== 'SHARED');

  const renderRow = (view: CrmSavedView) => {
    const isActive = view.id === activeView.id;
    const isPinned = view.id === pinnedViewId;
    return (
      <div
        key={view.id}
        className={`group flex items-center justify-between gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
          isActive
            ? 'bg-brand-surface font-semibold text-brand-primary'
            : 'text-brand-ink hover:bg-brand-surface/70'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(view.id);
            }}
            aria-label={
              view.favorite
                ? `Bỏ yêu thích giao diện ${view.name}`
                : `Thêm giao diện ${view.name} vào yêu thích`
            }
            className="shrink-0 rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Star
              size={13}
              className={
                view.favorite
                  ? 'fill-[#f5b32d] text-[#f5b32d]'
                  : 'text-brand-muted opacity-50 group-hover:opacity-100'
              }
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView(view);
              setOpen(false);
            }}
            className="min-w-0 flex-1 truncate text-left focus-visible:outline-none"
          >
            {view.name}
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPinView(view.id);
          }}
          aria-label={`Ghim mặc định giao diện ${view.name}`}
          title={isPinned ? 'Giao diện mặc định' : 'Đặt làm mặc định'}
          className={`shrink-0 rounded p-0.5 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
            isPinned
              ? 'text-brand-primary opacity-100'
              : 'text-brand-muted opacity-0 group-hover:opacity-100'
          }`}
        >
          <Pin size={12} aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <div ref={wrapperRef} className="relative inline-flex items-center gap-2">
      <div className="inline-flex items-center gap-1">
        <h1 className="text-lg font-semibold text-brand-ink">{activeView.name}</h1>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={`Chọn giao diện danh sách (${activeView.name})`}
          aria-expanded={open}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-brand-muted hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setOpen(false);
          onEditView();
        }}
        aria-label="Sửa giao diện"
        className="rounded px-1.5 py-0.5 text-xs font-semibold text-brand-primary hover:bg-brand-surface hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        Sửa
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Danh sách giao diện đã lưu"
          className="absolute left-0 top-full z-40 mt-1.5 flex max-h-[420px] w-72 flex-col overflow-hidden rounded-lg border border-brand-line bg-white shadow-soft"
        >
          <div className="flex-1 space-y-3 overflow-y-auto p-2.5">
            {favoriteViews.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[11px] font-bold text-brand-muted">YÊU THÍCH</div>
                {favoriteViews.map(renderRow)}
              </div>
            )}

            {sharedViews.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[11px] font-bold text-brand-muted">
                  CHIA SẺ VỚI TÔI
                </div>
                {sharedViews.map(renderRow)}
              </div>
            )}

            {myViews.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[11px] font-bold text-brand-muted">
                  TẠO BỞI TÔI
                </div>
                {myViews.map(renderRow)}
              </div>
            )}
          </div>

          <div className="border-t border-brand-line bg-brand-surface/50 p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCreateView();
              }}
              className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand-primary hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Plus size={14} aria-hidden="true" />
              <span>Thêm giao diện</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
