# webchat-fe

หน้าแชตแอดมินสำหรับตอบลูกค้าจาก LINE OA (Next.js 16 + TypeScript + Tailwind)

สถานะ: **UI อย่างเดียว** ใช้ข้อมูลตัวอย่างใน `src/lib/mock-data.ts` ยังไม่ได้ต่อ webchat-be

## เริ่มใช้งาน

```bash
npm install
npm run dev        # http://localhost:3000
```

## โครงสร้าง

```
src/app/page.tsx                      หน้าเดียว → <ChatApp />
src/components/chat/ChatApp.tsx       state ทั้งหมด + จุด TODO ที่จะเปลี่ยนเป็นเรียก API
src/components/chat/ConversationList  รายการห้อง: แท็บ เปิดอยู่/รอดำเนินการ/ปิดแล้ว, ค้นหา, unread
src/components/chat/ChatWindow        หัวห้อง (ผู้รับผิดชอบ/สถานะ), ข้อความ, คั่นวัน
src/components/chat/MessageBubble     text / รูป (pending/ready/failed) / sticker / location / unsend
                                      + สถานะส่ง กำลังส่ง / ส่งแล้ว / ส่งไม่สำเร็จ (ส่งใหม่)
src/components/chat/Composer          Enter ส่ง, Shift+Enter ขึ้นบรรทัด, ปิดช่องพิมพ์ถ้าลูกค้าบล็อก OA
src/components/chat/ContactPanel      ข้อมูลลูกค้า (LINE userId, สถานะเพื่อน)
src/types/chat.ts                     type ตรงกับ prisma schema ฝั่ง BE
```

## ตอนต่อ BE

ค้นหา `TODO` ใน `ChatApp.tsx` — แต่ละจุดระบุ endpoint ที่ต้องเรียกไว้แล้ว
(`/api/conversations`, `/:id/messages`, `/:id/read`, `PATCH /:id`) และเพิ่ม realtime สำหรับ
`message.created` / `message.updated`
