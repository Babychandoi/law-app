import gatewayClient from './gatewayClient';
import {
  Attachment,
  ConversationSummary,
  ConversationType,
  StaffUser,
  TeamMessage,
} from '../types/teamChat';

interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

const teamChatService = {
  listConversations: async (): Promise<ConversationSummary[]> => {
    const res = await gatewayClient.get<ApiResponse<ConversationSummary[]>>(
      '/staff-chat/conversations'
    );
    return res.data.data ?? [];
  },

  openDirect: async (targetUserId: string): Promise<ConversationSummary> => {
    const res = await gatewayClient.post<ApiResponse<ConversationSummary>>(
      '/staff-chat/conversations/direct',
      { targetUserId }
    );
    return res.data.data;
  },

  createGroup: async (
    name: string,
    memberIds: string[],
    type: ConversationType = 'GROUP'
  ): Promise<ConversationSummary> => {
    const res = await gatewayClient.post<ApiResponse<ConversationSummary>>(
      '/staff-chat/conversations/group',
      { name, memberIds, type }
    );
    return res.data.data;
  },

  fetchMessages: async (conversationId: string, before?: string): Promise<TeamMessage[]> => {
    const res = await gatewayClient.get<ApiResponse<TeamMessage[]>>(
      `/staff-chat/conversations/${conversationId}/messages`,
      { params: before ? { before } : {} }
    );
    return res.data.data ?? [];
  },

  markRead: async (conversationId: string): Promise<void> => {
    await gatewayClient.put(`/staff-chat/conversations/${conversationId}/read`);
  },

  addMember: async (conversationId: string, userId: string): Promise<void> => {
    await gatewayClient.post(`/staff-chat/conversations/${conversationId}/members`, { userId });
  },

  removeMember: async (conversationId: string, userId: string): Promise<void> => {
    await gatewayClient.delete(`/staff-chat/conversations/${conversationId}/members/${userId}`);
  },

  link: async (
    conversationId: string,
    payload: { customerId?: string; customerServiceId?: string }
  ): Promise<ConversationSummary> => {
    const res = await gatewayClient.post<ApiResponse<ConversationSummary>>(
      `/staff-chat/conversations/${conversationId}/link`,
      payload
    );
    return res.data.data;
  },

  listStaff: async (): Promise<StaffUser[]> => {
    const res = await gatewayClient.get<ApiResponse<StaffUser[]>>('/staff-chat/users');
    return res.data.data ?? [];
  },

  presence: async (): Promise<string[]> => {
    const res = await gatewayClient.get<ApiResponse<string[]>>('/staff-chat/presence');
    return res.data.data ?? [];
  },

  upload: async (file: File): Promise<Attachment> => {
    const form = new FormData();
    form.append('file', file);
    const res = await gatewayClient.post<ApiResponse<Attachment>>('/staff-chat/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return res.data.data;
  },
};

export default teamChatService;
