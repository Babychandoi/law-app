import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Send, Paperclip, Users, Plus, Search, UserPlus, UsersRound, X } from 'lucide-react';
import teamChatService from '../../../../../service/teamChat';
import { getMe } from '../../../../../service/auth';
import { ConversationSummary, StaffUser, TeamMessage } from '../../../../../types/teamChat';
import { useTeamChatSocket } from './useTeamChatSocket';
import {
  ensureNotificationPermission,
  playPing,
  showBrowserNotification,
} from './notify';

type NewMode = null | 'direct' | 'group';

export default function TeamChat() {
  // userId/role come from /auth/me (token is httpOnly now, not decodable in JS).
  const [me, setMe] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [online, setOnline] = useState<Set<string>>(new Set());
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [newMode, setNewMode] = useState<NewMode>(null);
  const [search, setSearch] = useState('');
  // Group-create state
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // activeId in a ref so the socket callback (registered once) sees the current value.
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const staffName = useCallback(
    (id: string) => staff.find((s) => s.id === id)?.fullName ?? id.slice(0, 8),
    [staff]
  );
  const staffNameRef = useRef(staffName);
  staffNameRef.current = staffName;

  const refreshConversations = useCallback(async () => {
    setConversations(await teamChatService.listConversations());
  }, []);

  const meRef = useRef(me);
  meRef.current = me;

  const socket = useTeamChatSocket({
    onMessage: (msg) => {
      // Only fires for the conversation currently subscribed (the open one): append it.
      if (msg.conversationId === activeIdRef.current) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        // A message arriving in the OPEN conversation is read immediately — clear its unread so
        // the badge doesn't grow while the user is looking at it. Skip our own echo.
        if (msg.senderId !== meRef.current) {
          teamChatService
            .markRead(msg.conversationId)
            .then(refreshConversations)
            .catch(() => undefined);
          return;
        }
      }
      refreshConversations();
    },
    onTyping: (userId) => {
      if (userId !== meRef.current) {
        setTypingUser(userId);
        setTimeout(() => setTypingUser(null), 3000);
      }
    },
    onInbox: (ev) => {
      // Cross-conversation new-message signal (the active conv is handled by onMessage).
      if (
        ev.type === 'NEW_MESSAGE' &&
        ev.senderId &&
        ev.senderId !== meRef.current &&
        ev.conversationId !== activeIdRef.current
      ) {
        const who = staffNameRef.current(ev.senderId);
        const preview = ev.preview ?? 'Tin nhắn mới';
        playPing();
        toast.info(`${who}: ${preview}`);
        showBrowserNotification(`Tin nhắn mới từ ${who}`, preview);
      }
      refreshConversations();
    },
    onPresence: (userId, isOnline) =>
      setOnline((prev) => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      }),
  });

  // Resolve current user once.
  useEffect(() => {
    getMe().then((u) => {
      setMe(u?.id ?? '');
      setIsAdmin(u?.role === 'ADMIN');
    });
  }, []);

  // Initial load
  useEffect(() => {
    refreshConversations();
    teamChatService.listStaff().then(setStaff).catch(() => undefined);
    teamChatService.presence().then((ids) => setOnline(new Set(ids))).catch(() => undefined);
  }, [refreshConversations]);

  const openConversation = useCallback(
    async (id: string) => {
      setActiveId(id);
      socket.subscribeConversation(id);
      setMessages(await teamChatService.fetchMessages(id));
      await teamChatService.markRead(id);
      refreshConversations();
    },
    [socket, refreshConversations]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !activeId) return;
    socket.sendMessage(activeId, text);
    setDraft('');
    // Sending = I'm clearly viewing this conversation -> clear any unread on it.
    teamChatService.markRead(activeId).then(refreshConversations).catch(() => undefined);
  };

  const handleDraftChange = (v: string) => {
    setDraft(v);
    if (!activeId) return;
    if (typingTimer.current) clearTimeout(typingTimer.current);
    socket.sendTyping(activeId);
    typingTimer.current = setTimeout(() => undefined, 1500);
  };

  const handleUpload = async (file: File) => {
    if (!activeId) return;
    try {
      const att = await teamChatService.upload(file);
      const isImage = att.mime?.startsWith('image/');
      socket.sendMessage(activeId, att.name, isImage ? 'IMAGE' : 'FILE', [att]);
    } catch {
      toast.error('Tải tệp thất bại');
    }
  };

  const closeNew = () => {
    setNewMode(null);
    setSearch('');
    setGroupName('');
    setGroupMembers(new Set());
  };

  const startDirect = async (userId: string) => {
    try {
      const conv = await teamChatService.openDirect(userId);
      closeNew();
      await refreshConversations();
      openConversation(conv.id);
    } catch {
      toast.error('Không mở được cuộc trò chuyện');
    }
  };

  const toggleGroupMember = (userId: string) =>
    setGroupMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });

  const createGroup = async () => {
    const name = groupName.trim();
    if (!name) {
      toast.warning('Nhập tên nhóm');
      return;
    }
    if (groupMembers.size === 0) {
      toast.warning('Chọn ít nhất 1 thành viên');
      return;
    }
    try {
      const conv = await teamChatService.createGroup(name, Array.from(groupMembers), 'GROUP');
      closeNew();
      await refreshConversations();
      openConversation(conv.id);
      toast.success('Đã tạo nhóm');
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      toast.error(status === 403 ? 'Chỉ admin được tạo nhóm' : 'Không tạo được nhóm');
    }
  };

  const convTitle = (c: ConversationSummary) =>
    c.type === 'DIRECT'
      ? staffName(c.memberIds.find((id) => id !== me) ?? '')
      : c.name ?? 'Nhóm';

  const filteredStaff = staff.filter(
    (s) => s.id !== me && (s.fullName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-xl shadow-soft overflow-hidden">
      {/* Sidebar: conversation list */}
      <aside className="w-80 border-r border-brand-line flex flex-col">
        <div className="p-4 border-b border-brand-line flex items-center justify-between">
          <h2 className="font-semibold text-brand-ink flex items-center gap-2">
            Chat nội bộ
            {totalUnread > 0 && (
              <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                {totalUnread}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                ensureNotificationPermission();
                setNewMode(newMode === 'direct' ? null : 'direct');
              }}
              className="p-2 rounded-lg hover:bg-brand-surface text-brand-gold"
              title="Nhắn riêng"
            >
              <Plus size={18} />
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  ensureNotificationPermission();
                  setNewMode(newMode === 'group' ? null : 'group');
                }}
                className="p-2 rounded-lg hover:bg-brand-surface text-brand-goldDark"
                title="Tạo nhóm (admin)"
              >
                <UsersRound size={18} />
              </button>
            )}
          </div>
        </div>

        {/* New direct */}
        {newMode === 'direct' && (
          <div className="p-3 border-b border-brand-line bg-brand-surface">
            <div className="flex items-center gap-2 mb-2 bg-white rounded-lg px-2 border border-brand-line">
              <Search size={14} className="text-brand-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm nhân viên..."
                className="flex-1 py-2 text-sm outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredStaff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => startDirect(s.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white text-left"
                >
                  <span className="relative">
                    <span className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-goldDark grid place-items-center text-xs font-semibold">
                      {s.fullName?.charAt(0) ?? '?'}
                    </span>
                    {online.has(s.id) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                    )}
                  </span>
                  <span className="text-sm">
                    <span className="block text-brand-ink">{s.fullName}</span>
                    <span className="block text-xs text-brand-muted">{s.position}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New group (admin only) */}
        {newMode === 'group' && isAdmin && (
          <div className="p-3 border-b border-brand-line bg-brand-surface space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-ink">Tạo nhóm mới</span>
              <button onClick={closeNew} className="text-brand-muted hover:text-brand-ink">
                <X size={16} />
              </button>
            </div>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Tên nhóm..."
              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
            <div className="flex items-center gap-2 bg-white rounded-lg px-2 border border-brand-line">
              <Search size={14} className="text-brand-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm thành viên..."
                className="flex-1 py-2 text-sm outline-none"
              />
            </div>
            <div className="text-xs text-brand-muted">Đã chọn: {groupMembers.size}</div>
            <div className="max-h-40 overflow-y-auto">
              {filteredStaff.map((s) => {
                const checked = groupMembers.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleGroupMember(s.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left ${
                      checked ? 'bg-brand-gold/15' : 'hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border grid place-items-center ${
                        checked ? 'bg-brand-gold border-brand-gold text-white' : 'border-brand-line'
                      }`}
                    >
                      {checked && '✓'}
                    </span>
                    <span className="text-sm text-brand-ink">{s.fullName}</span>
                    <span className="text-xs text-brand-muted">{s.position}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={createGroup}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-gold text-white py-2 text-sm hover:bg-brand-goldDark"
            >
              <UserPlus size={16} /> Tạo nhóm
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`w-full flex items-center gap-3 p-3 text-left border-b border-brand-line/50 hover:bg-brand-surface ${
                c.id === activeId ? 'bg-brand-surface' : ''
              }`}
            >
              <span className="w-10 h-10 rounded-full bg-brand-gold/20 text-brand-goldDark grid place-items-center font-semibold">
                {c.type === 'DIRECT' ? convTitle(c).charAt(0) : <UsersRound size={18} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex justify-between items-center">
                  <span className="text-sm font-medium text-brand-ink truncate">
                    {convTitle(c)}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-brand-gold text-white rounded-full px-2 py-0.5">
                      {c.unreadCount}
                    </span>
                  )}
                </span>
                <span className="block text-xs text-brand-muted truncate">
                  {c.lastMessage?.content ?? 'Chưa có tin nhắn'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main: messages */}
      <section className="flex-1 flex flex-col">
        {active ? (
          <>
            <header className="p-4 border-b border-brand-line flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-brand-gold/20 text-brand-goldDark grid place-items-center font-semibold">
                {active.type === 'DIRECT' ? convTitle(active).charAt(0) : <UsersRound size={18} />}
              </span>
              <div>
                <div className="font-semibold text-brand-ink">{convTitle(active)}</div>
                {active.type !== 'DIRECT' && (
                  <div className="text-xs text-brand-muted flex items-center gap-1">
                    <Users size={12} /> {active.memberIds.length} thành viên
                  </div>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-surface/40">
              {messages.map((m) => {
                const mine = m.senderId === me;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        mine ? 'bg-brand-gold text-white' : 'bg-white text-brand-ink shadow-sm'
                      }`}
                    >
                      {!mine && (
                        <div className="text-xs font-semibold text-brand-goldDark mb-0.5">
                          {staffName(m.senderId)}
                        </div>
                      )}
                      {m.type === 'IMAGE' && m.attachments?.[0] ? (
                        <img
                          src={m.attachments[0].url}
                          alt={m.attachments[0].name}
                          className="rounded-lg max-h-60"
                        />
                      ) : m.type === 'FILE' && m.attachments?.[0] ? (
                        <a
                          href={m.attachments[0].url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline break-all"
                        >
                          📎 {m.attachments[0].name}
                        </a>
                      ) : (
                        <span className="whitespace-pre-wrap break-words">{m.content}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {typingUser && (
                <div className="text-xs text-brand-muted italic">
                  {staffName(typingUser)} đang nhập...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <footer className="p-3 border-t border-brand-line flex items-center gap-2">
              <label className="p-2 rounded-lg hover:bg-brand-surface text-brand-muted cursor-pointer">
                <Paperclip size={18} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
              </label>
              <input
                value={draft}
                onChange={(e) => handleDraftChange(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())
                }
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-full border border-brand-line px-4 py-2 outline-none focus:border-brand-gold"
              />
              <button
                onClick={handleSend}
                className="p-2.5 rounded-full bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                <Send size={18} />
              </button>
            </footer>
          </>
        ) : (
          <div className="flex-1 grid place-items-center text-brand-muted">
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </section>
    </div>
  );
}
