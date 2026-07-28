// Helper thuần (không phụ thuộc React) cho giao diện chat nội bộ — tách ra để test.

export const GROUP_GAP = 5 * 60 * 1000; // gộp tin liên tiếp cùng người trong 5 phút
export const TIME_GAP = 10 * 60 * 1000; // hiện mốc thời gian khi cách nhau > 10 phút

export const initial = (name: string) => (name?.trim()?.charAt(0) || '?').toUpperCase();

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

/** Nhãn thời gian ngắn cho danh sách hội thoại (kiểu Messenger). */
export const fmtListTime = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  if (diff < 172800) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

/** Mốc thời gian giữa các cụm tin nhắn. */
export const fmtDivider = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? fmtTime(iso)
    : d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) +
        ' ' +
        fmtTime(iso);
};

export interface GroupableMessage {
  id: string;
  senderId: string;
  createdAt: string;
}

export interface GroupedRow<T> {
  m: T;
  mine: boolean;
  firstOfGroup: boolean;
  lastOfGroup: boolean;
  showTime: boolean;
}

/**
 * Tính vị trí từng tin trong cụm (để bo góc/hiện avatar kiểu Messenger):
 * - firstOfGroup/lastOfGroup: đầu/cuối cụm tin liên tiếp cùng người (trong GROUP_GAP).
 * - showTime: hiện mốc thời gian khi cách tin trước > TIME_GAP.
 */
export function groupMessages<T extends GroupableMessage>(
  messages: T[],
  meId: string
): GroupedRow<T>[] {
  return messages.map((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const t = new Date(m.createdAt).getTime();
    const firstOfGroup =
      !prev || prev.senderId !== m.senderId || t - new Date(prev.createdAt).getTime() > GROUP_GAP;
    const lastOfGroup =
      !next || next.senderId !== m.senderId || new Date(next.createdAt).getTime() - t > GROUP_GAP;
    const showTime = !prev || t - new Date(prev.createdAt).getTime() > TIME_GAP;
    return { m, mine: m.senderId === meId, firstOfGroup, lastOfGroup, showTime };
  });
}
