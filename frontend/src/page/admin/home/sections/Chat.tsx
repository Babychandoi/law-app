import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, MessageCircle, Send, MoreVertical, CheckCheck, User, Paperclip, Smile, Edit2, Check, X } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import chatService from '../../../../service/chat';
import { toast } from 'react-toastify';

interface ChatMessage {
  id: string;
  guestId: string;
  content: string;
  senderType: 'GUEST' | 'ADMIN';
  createdAt: string;
  adminId?: string;
  isRead?: boolean;
}

interface Conversation {
  guestId: string;
  guestName?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
  assignedAdmin?: string;
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface ChatStats {
  totalConversations: number;
  unreadConversations: number;
  assignedToAdmin: number;
  onlineUsers: number;
  todayMessages: number;
}

interface AdminUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface StatusUpdate {
  guestId: string;
  isOnline: boolean;
}

const WS_URL = process.env.REACT_APP_CHAT_WS_URL;

const AdminChatDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'assigned'>('all');
  const [stats, setStats] = useState<ChatStats>({
    totalConversations: 0,
    unreadConversations: 0,
    assignedToAdmin: 0,
    onlineUsers: 0,
    todayMessages: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const clientRef = useRef<Client | null>(null);

  const currentAdmin: AdminUser = {
    id: 'admin-001',
    name: 'Admin User',
    isOnline: true,
  };

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatService.fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    try {
      if (!WS_URL) {
        toast.error('Mất kết nối');
        return;
      }
      const socket = new SockJS(WS_URL);
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectHeaders: {
          adminId: currentAdmin.id // Send adminId in CONNECT headers
        },
        onConnect: () => {
          setIsConnected(true);
          
          client.subscribe('/topic/admin/messages', (message: IMessage) => {
            try {
              const newMessage: ChatMessage = JSON.parse(message.body);
              
              // Update conversations list
              fetchConversations();
              
              // If this message is for the currently selected conversation, add it to messages
              if (selectedConversation === newMessage.guestId) {
                setMessages(prev => {
                  const exists = prev.some(msg => msg.id === newMessage.id);
                  if (!exists) {
                    return [...prev, newMessage];
                  }
                  return prev;
                });
              }
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });

          // Subscribe to the specific guest conversation if one is selected
          if (selectedConversation) {
            client.subscribe(`/topic/chat/${selectedConversation}`, (message: IMessage) => {
              try {
                const newMessage: ChatMessage = JSON.parse(message.body);
                setMessages(prev => {
                  const exists = prev.some(msg => msg.id === newMessage.id);
                  if (!exists) {
                    return [...prev, newMessage];
                  }
                  return prev;
                });
              } catch (error) {
                console.error('Error parsing message:', error);
              }
            });
          }

          // Subscribe to online status updates
          client.subscribe('/topic/admin/online-status', (message: IMessage) => {
            try {
              const payload: StatusUpdate = JSON.parse(message.body);
              setConversations(prev => prev.map(conv =>
                conv.guestId === payload.guestId ? { ...conv, isOnline: payload.isOnline } : conv
              ));
            } catch (error) {
              console.error('Error parsing status update:', error);
            }
          });

          client.subscribe('/topic/errors', (message: IMessage) => {
            console.error('Server error:', message.body);
          });
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
        onStompError: (frame) => {
          setIsConnected(false);
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        }
      });

      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      setIsConnected(false);
    }
  }, [selectedConversation, fetchConversations, currentAdmin.id]);

  const fetchMessages = useCallback(async (guestId: string) => {
    try {
      const data = await chatService.fetchMessages(guestId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await chatService.fetchStats(currentAdmin.id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [currentAdmin.id]);

  const markConversationAsRead = useCallback(async (guestId: string) => {
    try {
      await chatService.markConversationAsRead(guestId);
      setConversations(prev => prev.map(conv =>
        conv.guestId === guestId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, []);

  const assignConversation = useCallback(async (guestId: string, adminId: string) => {
    try {
      await chatService.assignConversation(guestId, adminId);
      setConversations(prev => prev.map(conv =>
        conv.guestId === guestId ? { ...conv, assignedAdmin: adminId } : conv
      ));
    } catch (error) {
      console.error('Error assigning conversation:', error);
    }
  }, []);

  const updatePriority = useCallback(async (guestId: string, priority: string) => {
    try {
      await chatService.updatePriority(guestId, priority);
      setConversations(prev => prev.map(conv =>
        conv.guestId === guestId ? { ...conv, priority: priority as 'low' | 'normal' | 'high' } : conv
      ));
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  }, []);

  const updateGuestName = useCallback(async (guestId: string, name: string) => {
    try {
      await chatService.updateGuestName(guestId, name);
      setConversations(prev => prev.map(conv =>
        conv.guestId === guestId ? { ...conv, guestName: name } : conv
      ));
      setEditingName(false);
      setNewGuestName('');
    } catch (error) {
      console.error('Error updating guest name:', error);
    }
  }, []);

  const currentConversation = useMemo(() => 
    conversations.find(conv => conv.guestId === selectedConversation),
    [conversations, selectedConversation]
  );

  const handleStartEditName = useCallback(() => {
    setEditingName(true);
    setNewGuestName(currentConversation?.guestName || '');
  }, [currentConversation]);

  const handleCancelEditName = useCallback(() => {
    setEditingName(false);
    setNewGuestName('');
  }, []);

  const handleSaveGuestName = useCallback(() => {
    if (selectedConversation && newGuestName.trim()) {
      updateGuestName(selectedConversation, newGuestName.trim());
    }
  }, [selectedConversation, newGuestName, updateGuestName]);

  const sendMessage = useCallback(() => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !selectedConversation || !clientRef.current) return;

    const messagePayload = {
      guestId: selectedConversation,
      content: trimmedMessage,
      senderType: 'ADMIN',
      adminId: currentAdmin.id
    };

    try {
      clientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messagePayload),
      });

      setNewMessage('');
      setTimeout(() => messageInputRef.current?.focus(), 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMessage, selectedConversation, currentAdmin.id]);

  const handleConversationSelect = useCallback((guestId: string) => {
    setSelectedConversation(guestId);
    fetchMessages(guestId);
    markConversationAsRead(guestId);
  }, [fetchMessages, markConversationAsRead]);

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.guestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filterStatus) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'assigned':
        filtered = filtered.filter(conv => conv.assignedAdmin === currentAdmin.id);
        break;
    }

    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime;
    });
  }, [conversations, searchQuery, filterStatus, currentAdmin.id]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchStats();
    connectWebSocket();

    return () => {
      clientRef.current?.deactivate();
    };
  }, [connectWebSocket, fetchConversations, fetchStats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      if (!selectedConversation) {
        fetchConversations();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStats, fetchConversations, selectedConversation]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Quản lý Chat</h1>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalConversations}</div>
              <div className="text-xs text-blue-800">Tổng cuộc trò chuyện</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.unreadConversations}</div>
              <div className="text-xs text-red-800">Chưa đọc</div>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                filterStatus === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus('unread')}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                filterStatus === 'unread'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chưa đọc
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.guestId}
                  onClick={() => handleConversationSelect(conversation.guestId)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedConversation === conversation.guestId
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {conversation.guestName || conversation.guestId}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                              {conversation.priority === 'high' ? 'Cao' : conversation.priority === 'normal' ? 'Bình thường' : 'Thấp'}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] text-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ''}
                          </span>
                          
                          {/* {conversation.assignedAdmin === currentAdmin.id && (
                            <span className="text-xs text-green-600 font-medium">Được giao</span>
                          )} */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Không có cuộc trò chuyện nào</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    {currentConversation?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div>
                    {editingName ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newGuestName}
                          onChange={(e) => setNewGuestName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveGuestName();
                            if (e.key === 'Escape') handleCancelEditName();
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveGuestName}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEditName}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {currentConversation?.guestName || selectedConversation}
                        </h2>
                        <button
                          onClick={handleStartEditName}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="Đổi tên"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      {currentConversation?.isOnline ? (
                        <>
                          <span className="text-green-600">● </span>
                          Đang trực tuyến
                        </>
                      ) : (
                        currentConversation?.lastSeen && `Hoạt động ${formatTime(currentConversation.lastSeen)}`
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* <button
                    onClick={() => assignConversation(selectedConversation, currentAdmin.id)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                  >
                    Giao cho tôi
                  </button> */}
                  <select
                    value={currentConversation?.priority || 'normal'}
                    onChange={(e) => updatePriority(selectedConversation, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="low">Thấp</option>
                    <option value="normal">Bình thường</option>
                    <option value="high">Cao</option>
                  </select>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.senderType === 'ADMIN' ? 'order-2' : 'order-1'}`}>
                    {message.senderType === 'GUEST' && (
                      <div className="text-xs text-gray-500 mb-1">
                        {currentConversation?.guestName || 'Khách hàng'}
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl break-words ${
                        message.senderType === 'ADMIN'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      
                      {message.senderType === 'ADMIN' && (
                        <div className="flex items-center justify-end mt-1 space-x-1">
                          <CheckCheck className="w-3 h-3 text-blue-200" />
                        </div>
                      )}
                    </div>
                    
                    <div className={`text-xs mt-1 px-2 ${
                      message.senderType === 'ADMIN' ? 'text-right text-gray-400' : 'text-left text-gray-400'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-2 text-xs">
                {!isConnected && (
                  <div className="text-red-500 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Mất kết nối WebSocket
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chọn cuộc trò chuyện</h3>
              <p className="text-gray-500">Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatDashboard;