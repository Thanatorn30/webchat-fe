import type { Message } from "@/types/chat";
import { api } from "./client";

// API ข้อความ — ตรงกับ webchat-be src/controllers/messages.ts (ต้อง login)

export interface ListMessagesParams {
  /** id ของข้อความเก่าสุดที่มีอยู่ (ใช้ nextBefore จากหน้าก่อน) → ดึงที่เก่ากว่านั้น */
  before?: string;
  /** 1-100 (BE ค่าเริ่มต้น 50) */
  limit?: number;
}

export interface MessagePage {
  /** เรียงเก่า → ใหม่ เอาไปแสดงได้เลย */
  items: Message[];
  /** null = ไม่มีข้อความเก่ากว่านี้แล้ว */
  nextBefore: string | null;
}

/** GET /api/conversations/:id/messages?before=&limit=50 */
export async function listMessages(
  conversationId: string,
  params: ListMessagesParams = {},
): Promise<MessagePage> {
  return api.get<MessagePage>(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    { params: { limit: 50, ...params } },
  );
}

/** POST /api/conversations/:id/messages — แอดมินส่งข้อความ (ตอบ 201 เสมอ ดูผลที่ sendStatus) */
export function sendMessage(conversationId: string, text: string): Promise<Message> {
  return api.post<Message>(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    { text },
  );
}

/** POST /api/messages/:messageId/retry — ส่งซ้ำข้อความที่ sendStatus = failed */
export function retryMessage(messageId: string): Promise<Message> {
  return api.post<Message>(`/messages/${encodeURIComponent(messageId)}/retry`);
}
