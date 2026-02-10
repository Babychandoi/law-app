import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL;
const WS_URL = process.env.REACT_APP_CHAT_WS_URL;
const RECONNECT_DELAY = 5000;
const MAX_MESSAGE_LENGTH = 1000;

// Types
interface ChatMessage {
  id?: string;
  guestId: string;
  content: string;
  senderType: 'GUEST' | 'ADMIN';
  createdAt?: string;
  adminId?: string;
  isRead?: boolean;
  status?: 'sending' | 'sent' | 'failed';
  tempId?: string;
}

interface ChatBoxProps {
  onError?: (error: string) => void;
  maxMessages?: number;
  onClose?: () => void;
}

// Connection states
enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

// Utility functions
const generateGuestId = (): string => {
  const id = 'guest-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  return id;
};

const getStoredGuestId = (): string => {
  try {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = generateGuestId();
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  } catch {
    return generateGuestId();
  }
};

const setStoredGuestId = (id: string): void => {
  try {
    localStorage.setItem('guestId', id);
  } catch (error) {
    console.warn('Unable to store guest ID:', error);
  }
};

const formatTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return '';
  }
};

// API service to update online status
// Note: This endpoint requires admin authentication, so we skip it for guest users
// The backend should track online status through WebSocket connection/disconnection
const updateGuestOnlineStatus = async (guestId: string, isOnline: boolean) => {
  // Commented out as this requires admin auth
  // The WebSocket connection itself indicates online status
  console.log(`Guest ${guestId} ${isOnline ? 'connected' : 'disconnected'}`);
};

const ChatBox: React.FC<ChatBoxProps> = ({ onError, maxMessages = 100, onClose }) => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isAITyping, setIsAITyping] = useState(false); // NEW: AI typing indicator
  
  // Refs
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memoized values
  const guestId = useMemo(() => {
    const id = getStoredGuestId();
    setStoredGuestId(id);
    return id;
  }, []);

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.RECONNECTING;

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    });
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!API_BASE_URL) {
      const errorMsg = 'API URL không được cấu hình. Vui lòng kiểm tra REACT_APP_API_URL.';
      setApiError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_BASE_URL}/chat/${guestId}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('API trả về định dạng không hợp lệ');
      }
      
      const data = await res.json();
      const messageList = Array.isArray(data) ? data : [];
      
      setMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(messageList)) {
          return prev;
        }
        return messageList.slice(-maxMessages);
      });
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        const errorMsg = 'Kết nối bị timeout. Vui lòng thử lại.';
        setApiError(errorMsg);
        onError?.(errorMsg);
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định khi tải tin nhắn';
        console.error('Lỗi khi lấy tin nhắn:', err);
        setApiError(errorMsg);
        onError?.(errorMsg);
      }
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [guestId, onError, maxMessages]);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!WS_URL) {
      const errorMsg = 'WebSocket URL không được cấu hình. Vui lòng kiểm tra REACT_APP_CHAT_WS_URL.';
      setApiError(errorMsg);
      setConnectionState(ConnectionState.ERROR);
      onError?.(errorMsg);
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionState(retryCount > 0 ? ConnectionState.RECONNECTING : ConnectionState.CONNECTING);

    try {
      const socket = new SockJS(WS_URL);
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: RECONNECT_DELAY,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectHeaders: {
          guestId: guestId
        },
        onConnect: () => {
          setConnectionState(ConnectionState.CONNECTED);
          setRetryCount(0);
          setApiError(null);
          
          updateGuestOnlineStatus(guestId, true);
          
          client.subscribe(`/topic/chat/${guestId}`, (message: IMessage) => {
            try {
              const msg: ChatMessage = JSON.parse(message.body);
              
              // Hide AI typing indicator when message arrives
              setIsAITyping(false);
              
              setMessages(prev => {
                const existingIndex = prev.findIndex(existingMsg => 
                  (existingMsg.id && existingMsg.id === msg.id) ||
                  (existingMsg.tempId && existingMsg.guestId === msg.guestId &&
                   existingMsg.content === msg.content && 
                   existingMsg.senderType === msg.senderType &&
                   Math.abs(new Date(existingMsg.createdAt || '').getTime() - new Date(msg.createdAt || '').getTime()) < 2000)
                );
                
                if (existingIndex !== -1) {
                  const updatedMessages = [...prev];
                  updatedMessages[existingIndex] = {
                    ...msg,
                    status: msg.senderType === 'GUEST' ? ('sent' as const) : undefined
                  } as ChatMessage;
                  return updatedMessages;
                } else {
                  const newMessage: ChatMessage = {
                    ...msg,
                    status: msg.senderType === 'GUEST' ? ('sent' as const) : undefined
                  };
                  const newMessages = [...prev, newMessage];
                  return newMessages.slice(-maxMessages);
                }
              });
              
              setTimeout(() => scrollToBottom(), 100);
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });

          // Subscribe to error topic for server-side errors
          client.subscribe('/topic/errors', (message: IMessage) => {
            console.error('Server error:', message.body);
            setApiError('Lỗi từ server: ' + message.body);
          });
        },
        onDisconnect: () => {
          setConnectionState(ConnectionState.DISCONNECTED);
          updateGuestOnlineStatus(guestId, false);
        },
        onStompError: (frame) => {
          setConnectionState(ConnectionState.ERROR);
          setApiError('Lỗi kết nối WebSocket: ' + (frame.headers?.message || 'Không có chi tiết lỗi'));
          updateGuestOnlineStatus(guestId, false);
          
          const backoffDelay = Math.min(RECONNECT_DELAY * Math.pow(2, retryCount), 30000);
          setRetryCount(prev => prev + 1);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (retryCount < 5) {
              connectWebSocket();
            } else {
              setApiError('Không thể kết nối sau nhiều lần thử. Vui lòng tải lại trang.');
            }
          }, backoffDelay);
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          setConnectionState(ConnectionState.ERROR);
          setApiError('Không thể kết nối WebSocket');
          updateGuestOnlineStatus(guestId, false);
        }
      });

      client.activate();
      clientRef.current = client;
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionState(ConnectionState.ERROR);
      setApiError('Không thể tạo kết nối WebSocket');
      updateGuestOnlineStatus(guestId, false);
    }
  }, [guestId, onError, scrollToBottom, retryCount, maxMessages]);

  // Send message
  const sendMessage = useCallback(() => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || !isConnected || !clientRef.current) {
      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setApiError(`Tin nhắn không được vượt quá ${MAX_MESSAGE_LENGTH} ký tự`);
      return;
    }

    const tempId = 'temp-' + Date.now() + Math.random().toString(36).substring(2);
    const chatMessage: ChatMessage = {
      tempId,
      guestId,
      content: trimmedMessage,
      senderType: 'GUEST',
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    try {
      setMessages(prev => {
        const newMessages = [...prev, chatMessage];
        return newMessages.slice(-maxMessages);
      });
      
      clientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          guestId,
          content: trimmedMessage,
          senderType: 'GUEST'
        }),
      });

      setMessage('');
      setApiError(null);
      
      // Show AI typing indicator after sending message
      setTimeout(() => {
        setIsAITyping(true);
        scrollToBottom();
      }, 500);
      
      // Hide typing indicator after 10 seconds if no response
      setTimeout(() => {
        setIsAITyping(false);
      }, 10000);
      
      setTimeout(() => scrollToBottom(), 100);
      setTimeout(() => messageInputRef.current?.focus(), 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setApiError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      
      setMessages(prev => prev.map(msg => 
        msg.tempId === tempId 
          ? { ...msg, status: 'failed' }
          : msg
      ));
    }
  }, [message, isConnected, guestId, scrollToBottom, maxMessages]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Retry connection
  const retryConnection = useCallback(() => {
    setRetryCount(0);
    connectWebSocket();
  }, [connectWebSocket]);

  // Initialize component
  useEffect(() => {
    fetchMessages();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (clientRef.current) {
        updateGuestOnlineStatus(guestId, false);
        clientRef.current.deactivate();
      }
    };
  }, [fetchMessages, connectWebSocket, guestId]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // Connection status display
  const getConnectionStatus = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return { text: 'Đang kết nối', color: 'bg-green-400' };
      case ConnectionState.CONNECTING:
        return { text: 'Đang kết nối...', color: 'bg-yellow-400' };
      case ConnectionState.RECONNECTING:
        return { text: 'Đang kết nối lại...', color: 'bg-yellow-400' };
      case ConnectionState.ERROR:
        return { text: 'Lỗi kết nối', color: 'bg-red-400' };
      default:
        return { text: 'Không kết nối', color: 'bg-gray-400' };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div 
      className="transition-all duration-300 ease-in-out w-96 max-h-[600px] rounded-2xl overflow-hidden shadow-2xl"
      style={{ zIndex: 1000 }}
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-4 py-4 flex items-center justify-between shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        
        <div className="flex items-center space-x-3 relative z-10">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${isConnected ? 'animate-pulse' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${connectionStatus.color}`}></div>
          </div>
          <div>
            <h3 className="font-bold text-base">Hỗ trợ trực tuyến</h3>
            <p className="text-xs opacity-90 font-medium">{connectionStatus.text}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative z-10">
          {connectionState === ConnectionState.ERROR && (
            <button
              onClick={retryConnection}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 flex items-center justify-center hover:scale-110"
              title="Thử kết nối lại"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 flex items-center justify-center hover:scale-110"
            title="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div className="bg-gradient-to-b from-gray-50 to-white flex flex-col h-[544px]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-500">Đang tải tin nhắn...</span>
              </div>
            )}

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-800 text-xs font-medium">Lỗi kết nối</p>
                    <p className="text-red-600 text-xs mt-1">{apiError}</p>
                    {connectionState === ConnectionState.ERROR && (
                      <button
                        onClick={retryConnection}
                        className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                      >
                        Thử lại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {messages.length === 0 && !apiError && !isLoading && (
              <div className="text-center text-gray-500 mt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-700">Chào bạn!</p>
              <p className="text-sm text-gray-500 mt-1">Tôi có thể giúp gì cho bạn?</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={msg.id || msg.tempId || index} className={`flex ${msg.senderType === 'GUEST' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.senderType === 'GUEST' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl break-words shadow-sm relative ${
                      msg.senderType === 'GUEST' 
                        ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md ${
                            msg.status === 'sending' ? 'opacity-70' : msg.status === 'failed' ? 'opacity-50 bg-red-500' : ''
                          }` 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    
                    {msg.senderType === 'GUEST' && (
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        {msg.status === 'sending' && (
                          <>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                            <span className="text-xs text-white/80">Đang gửi...</span>
                          </>
                        )}
                        {msg.status === 'sent' && (
                          <svg className="w-3 h-3 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {msg.status === 'failed' && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-white font-medium">Thất bại</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* AI Bot Indicator */}
                    {msg.senderType === 'ADMIN' && msg.adminId === 'AI-BOT' && (
                      <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-gray-200">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.createdAt && msg.status !== 'sending' && (
                    <div className={`text-xs mt-1 px-2 ${
                      msg.senderType === 'GUEST' ? 'text-right text-gray-400' : 'text-left text-gray-400'
                    }`}>
                      {formatTime(msg.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* AI Typing Indicator */}
            {isAITyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-[80%]">
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-bl-md shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                        </svg>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      <span className="text-xs text-gray-500">Đang trả lời...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t-2 border-gray-200 bg-white">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={messageInputRef}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500"
                  placeholder={isConnected ? "Nhập tin nhắn của bạn..." : "Đang kết nối..."}
                  disabled={!isConnected || isConnecting}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || !isConnected || isConnecting}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
                  title="Gửi tin nhắn"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-2 text-xs">
              {!isConnected && connectionState !== ConnectionState.ERROR && (
                <div className="text-orange-500 flex items-center">
                  <svg className="w-3 h-3 mr-1 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  {connectionStatus.text}
                </div>
              )}
              
              {message.length > MAX_MESSAGE_LENGTH - 50 && (
                <div className={`${message.length >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-yellow-600'}`}>
                  {MAX_MESSAGE_LENGTH - message.length} ký tự còn lại
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;