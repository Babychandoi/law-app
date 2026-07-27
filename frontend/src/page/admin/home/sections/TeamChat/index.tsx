import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Send,
  Paperclip,
  Users,
  Plus,
  Search,
  UserPlus,
  UsersRound,
  X,
  ArrowLeft,
  ThumbsUp,
  Smile,
} from 'lucide-react';
import teamChatService from '../../../../../service/teamChat';
import { getMe } from '../../../../../service/auth';
import { EmojiPicker } from '../../../../../component/common/ui';
import { ConversationSummary, StaffUser, TeamMessage } from '../../../../../types/teamChat';
import { useTeamChatSocket } from './useTeamChatSocket';
import { ensureNotificationPermission, playPing, showBrowserNotification } from './notify';
import { initial, fmtTime, fmtListTime, fmtDivider, groupMessages } from './helpers';

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
  const [showEmoji, setShowEmoji] = useState(false);
  // Group-create state
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<Set<string>>(new Set());
  const [searchParams] = useSearchParams();
  const autoOpenId = searchParams.get('c');
  const lastAutoOpenRef = useRef<string | null>(null);
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
    teamChatService
      .listStaff()
      .then(setStaff)
      .catch(() => undefined);
    teamChatService
      .presence()
      .then((ids) => setOnline(new Set(ids)))
      .catch(() => undefined);
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
  }, [messages, typingUser]);

  // Tự mở hội thoại khi điều hướng kèm ?c=<id> (từ dropdown chat trên header).
  useEffect(() => {
    if (
      autoOpenId &&
      autoOpenId !== lastAutoOpenRef.current &&
      conversations.some((c) => c.id === autoOpenId)
    ) {
      lastAutoOpenRef.current = autoOpenId;
      openConversation(autoOpenId);
    }
  }, [autoOpenId, conversations, openConversation]);

  const sendText = (text: string, type: 'TEXT' = 'TEXT') => {
    if (!text || !activeId) return;
    socket.sendMessage(activeId, text, type);
    // Sending = I'm clearly viewing this conversation -> clear any unread on it.
    teamChatService
      .markRead(activeId)
      .then(refreshConversations)
      .catch(() => undefined);
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    sendText(text);
    setDraft('');
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

  const peerId = (c: ConversationSummary) =>
    c.type === 'DIRECT' ? (c.memberIds.find((id) => id !== me) ?? '') : '';

  const convTitle = (c: ConversationSummary) =>
    c.type === 'DIRECT' ? staffName(peerId(c)) : (c.name ?? 'Nhóm');

  const filteredStaff = staff.filter(
    (s) => s.id !== me && (s.fullName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  // Lọc danh sách đoạn chat theo ô tìm kiếm (chỉ khi không mở panel tạo mới).
  const shownConversations =
    newMode || !search.trim()
      ? conversations
      : conversations.filter((c) => convTitle(c).toLowerCase().includes(search.toLowerCase()));

  // Trạng thái online của người đối thoại (chat 1-1)
  const activePeer = active ? peerId(active) : '';
  const activePeerOnline = activePeer ? online.has(activePeer) : false;

  // Gộp tin liên tiếp + xác định vị trí trong cụm để bo góc kiểu Messenger.
  const rows = groupMessages(messages, me);

  // "Đã xem": ai đã đọc tin cuối cùng của tôi.
  const lastMessage = messages[messages.length - 1];
  const seenReaders =
    lastMessage && lastMessage.senderId === me
      ? (lastMessage.readBy || []).filter((id) => id !== me)
      : [];

  const isGroup = active?.type !== 'DIRECT';

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-xl shadow-soft overflow-hidden border border-gray-200">
      {/* Sidebar: conversation list — master-detail: ẩn trên mobile khi đã chọn hội thoại */}
      <aside
        className={`w-full flex-col border-r border-gray-200 lg:flex lg:w-[360px] ${
          activeId ? 'hidden' : 'flex'
        }`}
      >
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Đoạn chat
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
              className="w-9 h-9 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              title="Nhắn tin mới"
              aria-label="Nhắn tin mới"
            >
              <Plus size={18} />
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  ensureNotificationPermission();
                  setNewMode(newMode === 'group' ? null : 'group');
                }}
                className="w-9 h-9 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                title="Tạo nhóm (admin)"
                aria-label="Tạo nhóm"
              >
                <UsersRound size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Ô tìm kiếm luôn hiển thị kiểu Messenger */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <Search size={16} className="text-gray-500" />
            <input
              aria-label="Tìm kiếm trên đoạn chat"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm trên đoạn chat"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* New direct */}
        {newMode === 'direct' && (
          <div className="mx-3 mb-2 p-2 rounded-xl border border-gray-200 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 px-1 pb-1">Bắt đầu nhắn riêng</div>
            <div className="max-h-56 overflow-y-auto">
              {filteredStaff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => startDirect(s.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white text-left"
                >
                  <span className="relative">
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white grid place-items-center text-sm font-semibold">
                      {initial(s.fullName)}
                    </span>
                    {online.has(s.id) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                    )}
                  </span>
                  <span className="text-sm">
                    <span className="block text-gray-900 font-medium">{s.fullName}</span>
                    <span className="block text-xs text-gray-500">{s.position}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New group (admin only) */}
        {newMode === 'group' && isAdmin && (
          <div className="mx-3 mb-2 p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Tạo nhóm mới</span>
              <button
                onClick={closeNew}
                aria-label="Đóng"
                className="text-gray-500 hover:text-gray-900"
              >
                <X size={16} />
              </button>
            </div>
            <input
              aria-label="Tên nhóm"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Tên nhóm..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <div className="text-xs text-gray-500">Đã chọn: {groupMembers.size}</div>
            <div className="max-h-40 overflow-y-auto">
              {filteredStaff.map((s) => {
                const checked = groupMembers.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleGroupMember(s.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left ${
                      checked ? 'bg-blue-50' : 'hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border grid place-items-center text-[10px] ${
                        checked ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
                      }`}
                    >
                      {checked && '✓'}
                    </span>
                    <span className="text-sm text-gray-900">{s.fullName}</span>
                    <span className="text-xs text-gray-500">{s.position}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={createGroup}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-500 text-white py-2 text-sm font-medium hover:bg-blue-600"
            >
              <UserPlus size={16} /> Tạo nhóm
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {shownConversations.map((c) => {
            const unread = c.unreadCount > 0;
            const pOnline = c.type === 'DIRECT' && online.has(peerId(c));
            return (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                  c.id === activeId ? 'bg-blue-50' : 'hover:bg-gray-100'
                }`}
              >
                <span className="relative shrink-0">
                  <span className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white grid place-items-center font-semibold">
                    {c.type === 'DIRECT' ? initial(convTitle(c)) : <UsersRound size={22} />}
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
                      {fmtListTime(c.lastMessage?.at)}
                    </span>
                  </span>
                  <span className="flex justify-between items-center gap-2">
                    <span
                      className={`truncate text-sm ${
                        unread ? 'font-semibold text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {c.lastMessage
                        ? `${c.lastMessage.senderId === me ? 'Bạn: ' : ''}${c.lastMessage.content}`
                        : 'Chưa có tin nhắn'}
                    </span>
                    {unread && <span className="shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </span>
                </span>
              </button>
            );
          })}
          {shownConversations.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-10">
              {search.trim() ? 'Không tìm thấy đoạn chat' : 'Chưa có đoạn chat nào'}
            </div>
          )}
        </div>
      </aside>

      {/* Main: messages — ẩn trên mobile khi chưa chọn hội thoại */}
      <section className={`flex-1 flex-col bg-white ${activeId ? 'flex' : 'hidden lg:flex'}`}>
        {active ? (
          <>
            <header className="px-4 py-2.5 border-b border-gray-200 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                aria-label="Quay lại danh sách"
                className="-ml-1 rounded-full p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="relative shrink-0">
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white grid place-items-center font-semibold">
                  {isGroup ? <UsersRound size={20} /> : initial(convTitle(active))}
                </span>
                {!isGroup && activePeerOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                )}
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{convTitle(active)}</div>
                {isGroup ? (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} /> {active.memberIds.length} thành viên
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    {activePeerOnline ? (
                      <span className="text-green-600">Đang hoạt động</span>
                    ) : (
                      'Không hoạt động'
                    )}
                  </div>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 bg-white">
              {rows.map(({ m, mine, firstOfGroup, lastOfGroup, showTime }) => {
                const isImage = m.type === 'IMAGE' && m.attachments?.[0];
                const isFile = m.type === 'FILE' && m.attachments?.[0];
                // Bo góc: cạnh giáp tin cùng cụm thu nhỏ lại.
                const radius = mine
                  ? `rounded-2xl ${firstOfGroup ? '' : 'rounded-tr-md'} ${
                      lastOfGroup ? '' : 'rounded-br-md'
                    }`
                  : `rounded-2xl ${firstOfGroup ? '' : 'rounded-tl-md'} ${
                      lastOfGroup ? '' : 'rounded-bl-md'
                    }`;
                return (
                  <div key={m.id}>
                    {showTime && (
                      <div className="text-center text-[11px] text-gray-500 py-2">
                        {fmtDivider(m.createdAt)}
                      </div>
                    )}
                    <div
                      className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar cạnh tin người khác (chỉ ở tin cuối cụm) */}
                      {!mine &&
                        (lastOfGroup ? (
                          <span
                            title={staffName(m.senderId)}
                            className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white grid place-items-center text-[11px] font-semibold"
                          >
                            {initial(staffName(m.senderId))}
                          </span>
                        ) : (
                          <span className="w-7 shrink-0" />
                        ))}

                      <div
                        className={`max-w-[68%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}
                      >
                        {/* Tên người gửi (nhóm, đầu cụm) */}
                        {!mine && isGroup && firstOfGroup && (
                          <span className="text-[11px] text-gray-500 ml-3 mb-0.5">
                            {staffName(m.senderId)}
                          </span>
                        )}

                        {isImage ? (
                          <a
                            href={m.attachments[0].url}
                            target="_blank"
                            rel="noreferrer"
                            title={fmtTime(m.createdAt)}
                          >
                            <img
                              src={m.attachments[0].url}
                              alt={m.attachments[0].name}
                              className="rounded-2xl max-h-64 object-cover"
                            />
                          </a>
                        ) : isFile ? (
                          <a
                            href={m.attachments[0].url}
                            target="_blank"
                            rel="noreferrer"
                            title={fmtTime(m.createdAt)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm ${radius} ${
                              mine ? 'bg-[#0084ff] text-white' : 'bg-[#e9e9eb] text-gray-900'
                            }`}
                          >
                            <Paperclip size={16} /> {m.attachments[0].name}
                          </a>
                        ) : (
                          <div
                            title={fmtTime(m.createdAt)}
                            className={`px-3.5 py-2 text-[15px] leading-snug break-words whitespace-pre-wrap ${radius} ${
                              mine ? 'bg-[#0084ff] text-white' : 'bg-[#e9e9eb] text-gray-900'
                            }`}
                          >
                            {m.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Đang gõ — bong bóng 3 chấm động */}
              {typingUser && (
                <div className="flex items-end gap-2 justify-start pt-1">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white grid place-items-center text-[11px] font-semibold">
                    {initial(staffName(typingUser))}
                  </span>
                  <div className="bg-[#e9e9eb] rounded-2xl px-3.5 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              {/* Đã xem — avatar nhỏ dưới tin cuối của tôi */}
              {seenReaders.length > 0 && !typingUser && (
                <div className="flex justify-end gap-0.5 pr-1 pt-1">
                  {seenReaders.slice(0, 6).map((id) => (
                    <span
                      key={id}
                      title={`Đã xem: ${staffName(id)}`}
                      className="w-4 h-4 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white grid place-items-center text-[8px] font-semibold ring-1 ring-white"
                    >
                      {initial(staffName(id))}
                    </span>
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <footer className="px-3 py-3 border-t border-gray-200 flex items-center gap-2">
              <label className="w-9 h-9 grid place-items-center rounded-full hover:bg-gray-100 text-[#0084ff] cursor-pointer shrink-0">
                <Paperclip size={20} />
                <input
                  type="file"
                  aria-label="Đính kèm tệp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
              </label>
              <div className="relative flex-1 flex items-center bg-gray-100 rounded-full px-4">
                <input
                  aria-label="Nhập tin nhắn"
                  value={draft}
                  onChange={(e) => handleDraftChange(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())
                  }
                  placeholder="Aa"
                  className="flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowEmoji((v) => !v)}
                  aria-label="Chèn biểu tượng cảm xúc"
                  className="shrink-0 text-[#0084ff] hover:text-blue-600"
                >
                  <Smile size={20} />
                </button>
                {showEmoji && (
                  <EmojiPicker
                    className="bottom-12 right-0"
                    onPick={(e) => setDraft((d) => d + e)}
                    onClose={() => setShowEmoji(false)}
                  />
                )}
              </div>
              {draft.trim() ? (
                <button
                  onClick={handleSend}
                  aria-label="Gửi tin nhắn"
                  className="w-9 h-9 grid place-items-center rounded-full text-[#0084ff] hover:bg-gray-100 shrink-0"
                >
                  <Send size={20} />
                </button>
              ) : (
                <button
                  onClick={() => sendText('👍')}
                  aria-label="Gửi biểu tượng thích"
                  className="w-9 h-9 grid place-items-center rounded-full text-[#0084ff] hover:bg-gray-100 shrink-0"
                >
                  <ThumbsUp size={20} />
                </button>
              )}
            </footer>
          </>
        ) : (
          <div className="flex-1 grid place-items-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 grid place-items-center">
                <Send size={26} className="text-gray-400" />
              </div>
              Chọn một cuộc trò chuyện để bắt đầu
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
