import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/lib/api/client";
import { getToken } from "@/lib/session";
import type { Contact, Conversation, Message } from "@/types/chat";

// realtime จาก webchat-be (Socket.IO) — BE → FE ทางเดียว, ส่งข้อความยังใช้ REST
// รายการ event ดู webchat-be/docs/REALTIME_WEBSOCKET.md

export interface RealtimeEvents {
  "message.created": (data: { conversationId: string; message: Message }) => void;
  "message.updated": (data: { conversationId: string; message: Message }) => void;
  "message.deleted": (data: { conversationId: string; messageId: string }) => void;
  "conversation.updated": (data: { conversation: Conversation }) => void;
  "contact.updated": (data: { contact: Contact }) => void;
}

// API_URL = "https://xxx.onrender.com/api" → socket ต่อที่ origin (ตัด /api ออก)
const SOCKET_URL = new URL(API_URL, typeof window === "undefined" ? "http://localhost" : window.location.href).origin;

let socket: Socket<RealtimeEvents> | undefined;

export function getSocket(): Socket<RealtimeEvents> {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      // เรียกทุกครั้งที่ต่อ / ต่อใหม่ → ได้ token ล่าสุดเสมอ
      auth: (cb) => cb({ token: getToken() }),
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = undefined;
}
