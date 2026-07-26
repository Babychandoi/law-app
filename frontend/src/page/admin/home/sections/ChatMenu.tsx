import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, UsersRound, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import teamChatService from '../../../../service/teamChat';
import { getMe } from '../../../../service/auth';
import { ConversationSummary, StaffUser } from '../../../../types/teamChat';
import { ADMIN_BASE } from '../navConfig';

const PAGE_SIZE = 6;

const initial = (name: string) => (name?.trim()?.charAt(0) || '?').toUpperCase();

// Nhãn thời gian ngắn kiểu Messenger.
const fmtTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  if (diff < 172800) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

/**
 * Icon chat trên header: bấm xổ danh sách đoạn chat nội bộ sắp theo tin mới nhất,
 * có phân trang ("Xem thêm"), click mở đúng hội thoại trong trang Chat nội bộ.
 */
const ChatMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState('');
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [convs, setConvs] = useState<ConversationSummary[]>([]);
  const [shown, setShown] = useState(PAGE_SIZE);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const staffName = useCallback(
    (id: string) => staff.find((s) => s.id === id)?.fullName ?? id.slice(0, 8),
    [staff]
  );

  const load = useCallback(() => {
    teamChatService
      .listConversations()
      .then(setConvs)
      .catch(() => undefined);
  }, []);

  // Nạp một lần: người dùng hiện tại + danh bạ nhân viên.
  useEffect(() => {
    getMe().then((u) => setMe(u?.id ?? ''));
    teamChatService
      .listStaff()
      .then(setStaff)
      .catch(() => undefined);
  }, []);

  // Nạp danh sách + làm mới badge định kỳ (30s).
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  // Mở dropdown -> làm mới ngay và reset phân trang.
  useEffect(() => {
    if (open) {
      load();
      setShown(PAGE_SIZE);
    }
  }, [open, load]);

  // Đóng khi click ra ngoài.
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const peerId = (c: ConversationSummary) =>
    c.type === 'DIRECT' ? (c.memberIds.find((id) => id !== me) ?? '') : '';
  const convTitle = (c: ConversationSummary) =>
    c.type === 'DIRECT' ? staffName(peerId(c)) : (c.name ?? 'Nhóm');

  // Sắp theo tin mới nhất (fallback updatedAt).
  const sorted = [...convs].sort((a, b) => {
    const ta = new Date(a.lastMessage?.at ?? a.updatedAt).getTime();
    const tb = new Date(b.lastMessage?.at ?? b.updatedAt).getTime();
    return tb - ta;
  });
  const totalUnread = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const visible = sorted.slice(0, shown);

  const openConv = (id: string) => {
    setOpen(false);
    navigate(`${ADMIN_BASE}/team-chat?c=${id}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat nội bộ"
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
      >
        <MessageCircle size={20} className="text-gray-600" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Chat nội bộ</h3>
            <button
              onClick={() => openConv('')}
              className="text-xs text-brand-goldDark hover:underline"
            >
              Mở trang chat
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                <p>Chưa có đoạn chat nào</p>
              </div>
            ) : (
              visible.map((c) => {
                const unread = c.unreadCount > 0;
                const pOnline = false; // presence realtime nằm ở trang chat; dropdown chỉ hiển thị danh sách
                return (
                  <button
                    key={c.id}
                    onClick={() => openConv(c.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left border-b border-gray-100 hover:bg-gray-50 ${
                      unread ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <span className="relative shrink-0">
                      <span className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white grid place-items-center font-semibold">
                        {c.type === 'DIRECT' ? initial(convTitle(c)) : <UsersRound size={20} />}
                      </span>
                      {pOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex justify-between items-center gap-2">
                        <span
                          className={`truncate ${
                            unread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'
                          }`}
                        >
                          {convTitle(c)}
                        </span>
                        <span className="shrink-0 text-xs text-gray-500">
                          {fmtTime(c.lastMessage?.at)}
                        </span>
                      </span>
                      <span className="flex justify-between items-center gap-2">
                        <span
                          className={`truncate text-sm ${
                            unread ? 'font-semibold text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {c.lastMessage
                            ? `${c.lastMessage.senderId === me ? 'Bạn: ' : ''}${
                                c.lastMessage.content
                              }`
                            : 'Chưa có tin nhắn'}
                        </span>
                        {unread && (
                          <span className="shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                        )}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {sorted.length > shown && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShown((n) => n + PAGE_SIZE)}
                className="w-full flex items-center justify-center gap-1 text-sm text-brand-goldDark hover:underline"
              >
                <ChevronDown size={16} />
                Xem thêm ({Math.min(PAGE_SIZE, sorted.length - shown)})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMenu;
