import type { Conversation, ConversationStatus } from "@/types/chat";
import { api } from "./client";

// API /api/conversations — ตรงกับ webchat-be src/routes/conversations.ts (ต้อง login)

export interface ListConversationsParams {
  status?: ConversationStatus;
  /** id ของห้องสุดท้ายจากหน้าก่อน (ใช้ nextCursor ที่ได้กลับมา) */
  cursor?: string;
  /** 1-100 (BE ค่าเริ่มต้น 30) */
  limit?: number;
}

export interface ConversationPage {
  items: Conversation[];
  /** null = ไม่มีหน้าถัดไป */
  nextCursor: string | null;
}

export interface CreateConversationInput {
  contactId: string;
  status?: ConversationStatus;
  assignedAdminId?: string | null;
}

export type UpdateConversationInput = Partial<Pick<Conversation, "status" | "assignedAdminId">>;

const path = (id: string) => `/conversations/${encodeURIComponent(id)}`;

/** GET /api/conversations?status=&cursor=&limit= — เรียงตาม lastMessageAt ล่าสุดก่อน */
export function listConversations(params: ListConversationsParams = {}): Promise<ConversationPage> {
  return api.get<ConversationPage>("/conversations", { params });
}

/** GET /api/conversations/:id */
export function getConversation(id: string): Promise<Conversation> {
  return api.get<Conversation>(path(id));
}

/** POST /api/conversations — 1 contact มีได้ 1 ห้อง (ซ้ำ → 409) */
export function createConversation(input: CreateConversationInput): Promise<Conversation> {
  return api.post<Conversation>("/conversations", input);
}

/** PATCH /api/conversations/:id — { status?, assignedAdminId? } */
export function updateConversation(id: string, input: UpdateConversationInput): Promise<Conversation> {
  return api.patch<Conversation>(path(id), input);
}

/** POST /api/conversations/:id/read — unreadCount = 0 */
export function markConversationRead(id: string): Promise<Conversation> {
  return api.post<Conversation>(`${path(id)}/read`);
}

/** DELETE /api/conversations/:id — ลบห้อง + ข้อความทั้งหมด (owner เท่านั้น) */
export function deleteConversation(id: string): Promise<void> {
  return api.delete(path(id));
}
