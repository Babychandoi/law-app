export type ConversationType = 'DIRECT' | 'GROUP' | 'CHANNEL';
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';

export interface Attachment {
  url: string;
  name: string;
  mime: string;
  size: number;
}

export interface LastMessage {
  content: string;
  senderId: string;
  at: string;
}

export interface ConversationSummary {
  id: string;
  type: ConversationType;
  name: string | null;
  createdBy: string;
  memberIds: string[];
  linkedCustomerId: string | null;
  linkedCustomerServiceId: string | null;
  lastMessage: LastMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface TeamMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  attachments: Attachment[];
  readBy: string[];
  createdAt: string;
  editedAt: string | null;
}

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  position: string;
  email: string;
}

export interface InboxEvent {
  type: string;
  conversationId: string;
  unreadCount: number;
  senderId?: string | null;
  preview?: string | null;
}
