import axiosClient from './axiosClient';
import { ApiResponse } from '../types/admin';
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


const chatService = {
  // Fetch all conversations
  fetchConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await axiosClient.get<Promise<ApiResponse<Conversation[]>>>(`/chat/admin/conversations`);
      const data = await response.data;
      if (data.code === 200) {
        return data.data;
      }
      return [];
    } catch (error) {
      toast.error('Không thể lấy danh sách cuộc trò chuyện');
      return [];
    }
  },

  // Fetch messages for a specific conversation
  fetchMessages: async (guestId: string): Promise<ChatMessage[]> => {
    try {
      const response = await axiosClient.get<ChatMessage[]>(`/chat/${guestId}`);
      return response.data;
    } catch (error) {
      toast.error('Không thể lấy danh sách cuộc trò chuyện');
      return [];
    }
  },

  // Fetch chat statistics
  fetchStats: async (adminId: string): Promise<ChatStats> => {
    try {
      const response = await axiosClient.get<ChatStats>(`/chat/admin/stats/${adminId}`);
      return response.data;
    } catch (error) {
      toast.error('Không thể lấy danh sách cuộc trò chuyện');
      return {
        totalConversations: 0,
        unreadConversations: 0,
        assignedToAdmin: 0,
        onlineUsers: 0,
        todayMessages: 0,
      };
    }
  },

  // Mark conversation as read
  markConversationAsRead: async (guestId: string): Promise<void> => {
    try {
      await axiosClient.put(`/chat/admin/conversations/${guestId}/read`);
    } catch (error) {
      toast.error('Không thể lấy danh sách cuộc trò chuyện');
    }
  },

  // Assign conversation to admin
  assignConversation: async (guestId: string, adminId: string): Promise<void> => {
    try {
      await axiosClient.put(`/chat/admin/conversations/${guestId}/assign/${adminId}`);
    } catch (error) {
      toast.error('Không thể lấy danh sách cuộc trò chuyện');
    }
  },

  // Update conversation priority
  updatePriority: async (guestId: string, priority: string): Promise<void> => {
    try {
      await axiosClient.put(`/chat/admin/conversations/${guestId}/priority/${priority}`);
    } catch (error) {
      toast.error('Không thể lấy danh sách cuộc trò chuyện');
    }
  },

  updateGuestOnlineStatus: async (guestId: string, isOnline: boolean): Promise<void> => {
    try {
      await axiosClient.put(`/chat/admin/guest/${guestId}/online/${isOnline}`);
    } catch (error) {
      toast.error('Không thể lấy danh sách cuộc trò chuyện');
    }
  },

  updateGuestName: async (guestId: string, name: string): Promise<void> => {
    try {
      await axiosClient.put(`/chat/admin/guest/${guestId}/name`, null, {
        params: { name }
      });
      toast.success('Đã cập nhật tên khách hàng');
    } catch (error) {
      toast.error('Không thể cập nhật tên khách hàng');
    }
  }
};

export default chatService;