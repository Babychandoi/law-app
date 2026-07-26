import { useEffect, useRef } from 'react';

// Bộ emoji thông dụng — đủ dùng cho chat nội bộ, không cần thư viện ngoài (tránh phình bundle).
const EMOJIS = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '😘',
  '😎',
  '🤔',
  '😅',
  '😉',
  '🙂',
  '😌',
  '😢',
  '😭',
  '😡',
  '😱',
  '🥰',
  '😴',
  '🤗',
  '👍',
  '👎',
  '👏',
  '🙏',
  '💪',
  '👌',
  '✌️',
  '🤝',
  '🙌',
  '👋',
  '🔥',
  '🎉',
  '✅',
  '❌',
  '❤️',
  '💯',
  '⭐',
  '⚡',
  '💡',
  '📌',
  '📎',
  '📅',
  '⏰',
  '💼',
  '⚖️',
  '📝',
  '☕',
  '🚀',
  '✨',
  '🥳',
];

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  onClose: () => void;
  /** Class định vị popover (mặc định nổi phía trên, canh trái). */
  className?: string;
}

/** Bảng chọn emoji nhẹ: lưới emoji + đóng khi click ra ngoài / Escape. */
export default function EmojiPicker({ onPick, onClose, className = '' }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Chọn biểu tượng cảm xúc"
      className={`absolute z-50 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg ${className}`}
    >
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onPick(e)}
            className="h-8 w-8 rounded-lg text-xl leading-none hover:bg-gray-100"
            aria-label={`Chèn ${e}`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
