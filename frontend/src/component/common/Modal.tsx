import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  /** Tiêu đề (liên kết aria-labelledby). Bỏ trống nếu tự đặt tiêu đề trong children. */
  title?: string;
  onClose: () => void;
  children: ReactNode;
  /** Nội dung chân modal (nút hành động). */
  footer?: ReactNode;
  /** max-width lớp dialog. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Modal có sẵn accessibility chuẩn (WAI-ARIA dialog): role=dialog, aria-modal, aria-labelledby,
 * focus vào modal khi mở, FOCUS TRAP trong modal, đóng bằng Escape/backdrop, TRẢ focus về phần tử
 * đã mở modal khi đóng, và khoá cuộn nền. Dùng chung để chuẩn hoá toàn bộ modal admin.
 */
export default function Modal({ title, onClose, children, footer, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Giữ onClose trong ref để effect thiết lập modal CHỈ chạy khi mount.
  // Nếu phụ thuộc trực tiếp vào onClose (thường là hàm mới mỗi lần render của
  // component cha), effect sẽ chạy lại theo từng lần re-render (mỗi ký tự gõ),
  // khiến focus bị đưa về ô đầu tiên -> mất focus khi đang nhập.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Khoá cuộn nền
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Đưa focus vào modal
    const focusables = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);
    (focusables()[0] ?? dialogRef.current)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
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
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
    // Chỉ chạy một lần khi mở/đóng modal (dùng onCloseRef bên trong).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`flex max-h-[90vh] w-full ${SIZE[size]} flex-col overflow-hidden rounded-xl bg-white shadow-xl outline-none`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 id={titleId} className="text-lg font-semibold text-gray-800">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
