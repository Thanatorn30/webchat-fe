// โครงข้อมูลฝั่ง FE — ตรงกับ prisma/schema.prisma ใน webchat-be

export type ConversationStatus = "open" | "pending" | "closed";
export type MessageDirection = "in" | "out";
export type MessageType = "text" | "image" | "video" | "audio" | "file" | "sticker" | "location";
export type MediaStatus = "pending" | "ready" | "failed";
export type SendStatus = "queued" | "sent" | "failed";

export type AdminRole = "owner" | "agent";

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

export interface Contact {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  isFollowing: boolean;
  followedAt: string | null;
  unfollowedAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  status: ConversationStatus;
  assignedAdminId: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  senderAdminId: string | null;
  type: MessageType;
  text: string | null;
  payload?: Record<string, unknown> | null;
  mediaUrl?: string | null; // signed URL จาก GET /api/media/:messageId
  mediaStatus?: MediaStatus | null;
  sendStatus?: SendStatus | null;
  sendError?: string | null;
  isUnsent: boolean;
  createdAt: string;
}
