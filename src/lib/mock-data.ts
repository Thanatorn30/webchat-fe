import type { Admin, Conversation, Message } from "@/types/chat";

// ข้อมูลตัวอย่างสำหรับทำ UI — ยังไม่ได้ต่อ API จริง

// เวลาเป็นแบบ "ก่อนหน้านี้ X นาที" จึงสร้างตอนเปิดหน้า (ฝั่ง client) ผ่าน createMockData()

export const currentAdmin: Admin = {
  id: "a1",
  name: "แอดมิน เอ",
  email: "admin-a@example.com",
  role: "owner",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const admins: Admin[] = [
  currentAdmin,
  {
    id: "a2",
    name: "แอดมิน บี",
    email: "admin-b@example.com",
    role: "agent",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export function createMockData(): { conversations: Conversation[]; messages: Record<string, Message[]> } {
  const now = Date.now();
  const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();
  let seq = 0;
  const msg = (m: Omit<Message, "id" | "isUnsent"> & { isUnsent?: boolean }): Message => ({
    id: `m${++seq}`,
    isUnsent: false,
    ...m,
  });

  const conversations: Conversation[] = [
    {
      id: "c1",
      contact: {
        id: "ct1",
        lineUserId: "U4af4980629a1b2c3d4e5f60718293a4b",
        displayName: "สมชาย ใจดี",
        pictureUrl: null,
        isFollowing: true,
        followedAt: minutesAgo(60 * 24 * 12),
        unfollowedAt: null,
        createdAt: minutesAgo(60 * 24 * 12),
      },
      status: "open",
      assignedAdminId: "a1",
      lastMessageAt: minutesAgo(2),
      lastMessagePreview: "ขอใบเสนอราคาแพ็กเกจรายปีได้ไหมครับ",
      unreadCount: 2,
    },
    {
      id: "c2",
      contact: {
        id: "ct2",
        lineUserId: "U8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
        displayName: "Nok Bakery",
        pictureUrl: null,
        isFollowing: true,
        followedAt: minutesAgo(60 * 24 * 40),
        unfollowedAt: null,
        createdAt: minutesAgo(60 * 24 * 40),
      },
      status: "open",
      assignedAdminId: null,
      lastMessageAt: minutesAgo(18),
      lastMessagePreview: "[รูปภาพ]",
      unreadCount: 1,
    },
    {
      id: "c3",
      contact: {
        id: "ct3",
        lineUserId: "U1f2e3d4c5b6a79880716253443526170",
        displayName: "วิภา ร.",
        pictureUrl: null,
        isFollowing: true,
        followedAt: minutesAgo(60 * 24 * 3),
        unfollowedAt: null,
        createdAt: minutesAgo(60 * 24 * 3),
      },
      status: "pending",
      assignedAdminId: "a2",
      lastMessageAt: minutesAgo(95),
      lastMessagePreview: "ได้ค่ะ เดี๋ยวลองดูก่อนนะคะ",
      unreadCount: 0,
    },
    {
      id: "c4",
      contact: {
        id: "ct4",
        lineUserId: "U99aa88bb77cc66dd55ee44ff33aa22bb",
        displayName: "Krit",
        pictureUrl: null,
        isFollowing: false,
        followedAt: minutesAgo(60 * 24 * 30),
        unfollowedAt: minutesAgo(60 * 5),
        createdAt: minutesAgo(60 * 24 * 30),
      },
      status: "open",
      assignedAdminId: null,
      lastMessageAt: minutesAgo(60 * 6),
      lastMessagePreview: "ไม่สนใจแล้วครับ",
      unreadCount: 0,
    },
    {
      id: "c5",
      contact: {
        id: "ct5",
        lineUserId: "U0011223344556677889900aabbccddee",
        displayName: "ร้านกาแฟหน้าปากซอย",
        pictureUrl: null,
        isFollowing: true,
        followedAt: minutesAgo(60 * 24 * 90),
        unfollowedAt: null,
        createdAt: minutesAgo(60 * 24 * 90),
      },
      status: "closed",
      assignedAdminId: "a1",
      lastMessageAt: minutesAgo(60 * 26),
      lastMessagePreview: "ขอบคุณมากครับ 🙏",
      unreadCount: 0,
    },
  ];

  const messages: Record<string, Message[]> = {
    c1: [
      msg({ conversationId: "c1", direction: "in", senderAdminId: null, type: "text", text: "สวัสดีครับ สนใจระบบเช็กอินพนักงานครับ", createdAt: minutesAgo(60 * 25) }),
      msg({ conversationId: "c1", direction: "out", senderAdminId: "a1", type: "text", text: "สวัสดีครับ ยินดีให้ข้อมูลครับ ตอนนี้มีพนักงานประมาณกี่คนครับ", sendStatus: "sent", createdAt: minutesAgo(60 * 24 + 50) }),
      msg({ conversationId: "c1", direction: "in", senderAdminId: null, type: "text", text: "ประมาณ 35 คนครับ มี 2 สาขา", createdAt: minutesAgo(60 * 24 + 40) }),
      msg({ conversationId: "c1", direction: "in", senderAdminId: null, type: "sticker", text: null, payload: { packageId: "446", stickerId: "1988" }, createdAt: minutesAgo(60 * 24 + 39) }),
      msg({ conversationId: "c1", direction: "out", senderAdminId: "a1", type: "text", text: "รับทราบครับ เดี๋ยวส่งรายละเอียดแพ็กเกจให้นะครับ", sendStatus: "failed", sendError: "429 Too Many Requests", createdAt: minutesAgo(60 * 24 + 30) }),
      msg({ conversationId: "c1", direction: "in", senderAdminId: null, type: "text", text: "ยังไม่ได้รับเลยครับ", createdAt: minutesAgo(3) }),
      msg({ conversationId: "c1", direction: "in", senderAdminId: null, type: "text", text: "ขอใบเสนอราคาแพ็กเกจรายปีได้ไหมครับ", createdAt: minutesAgo(2) }),
    ],
    c2: [
      msg({ conversationId: "c2", direction: "in", senderAdminId: null, type: "text", text: "สลิปโอนเงินค่ะ", createdAt: minutesAgo(20) }),
      msg({ conversationId: "c2", direction: "in", senderAdminId: null, type: "image", text: null, mediaStatus: "ready", mediaUrl: null, createdAt: minutesAgo(19) }),
      msg({ conversationId: "c2", direction: "in", senderAdminId: null, type: "image", text: null, mediaStatus: "pending", createdAt: minutesAgo(18) }),
    ],
    c3: [
      msg({ conversationId: "c3", direction: "in", senderAdminId: null, type: "text", text: "ทดลองใช้ฟรีกี่วันคะ", createdAt: minutesAgo(120) }),
      msg({ conversationId: "c3", direction: "out", senderAdminId: "a2", type: "text", text: "ทดลองได้ 14 วันค่ะ ไม่ต้องผูกบัตร", sendStatus: "sent", createdAt: minutesAgo(110) }),
      msg({ conversationId: "c3", direction: "in", senderAdminId: null, type: "text", text: "ขอโทษค่ะ พิมพ์ผิดห้อง", isUnsent: true, createdAt: minutesAgo(100) }),
      msg({ conversationId: "c3", direction: "in", senderAdminId: null, type: "text", text: "ได้ค่ะ เดี๋ยวลองดูก่อนนะคะ", createdAt: minutesAgo(95) }),
    ],
    c4: [
      msg({ conversationId: "c4", direction: "out", senderAdminId: "a1", type: "text", text: "สวัสดีครับ มีโปรโมชันเดือนนี้นะครับ", sendStatus: "sent", createdAt: minutesAgo(60 * 7) }),
      msg({ conversationId: "c4", direction: "in", senderAdminId: null, type: "text", text: "ไม่สนใจแล้วครับ", createdAt: minutesAgo(60 * 6) }),
    ],
    c5: [
      msg({ conversationId: "c5", direction: "in", senderAdminId: null, type: "location", text: null, payload: { title: "ร้านกาแฟหน้าปากซอย", address: "ถ.สุขุมวิท กรุงเทพฯ" }, createdAt: minutesAgo(60 * 27) }),
      msg({ conversationId: "c5", direction: "out", senderAdminId: "a1", type: "text", text: "ได้รับตำแหน่งแล้วครับ ทีมจะเข้าไปติดตั้งพรุ่งนี้ 10 โมงครับ", sendStatus: "sent", createdAt: minutesAgo(60 * 26 + 10) }),
      msg({ conversationId: "c5", direction: "in", senderAdminId: null, type: "text", text: "ขอบคุณมากครับ 🙏", createdAt: minutesAgo(60 * 26) }),
    ],
  };

  return { conversations, messages };
}
