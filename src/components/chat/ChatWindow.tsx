"use client";

import { Fragment, useEffect, useRef } from "react";
import type { Admin, Conversation, ConversationStatus, Message } from "@/types/chat";
import { dayKey, formatDayDivider } from "@/lib/format";
import { Avatar } from "./Avatar";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";

interface Props {
  conversation: Conversation;
  messages: Message[];
  loadingMessages: boolean;
  /** ยังมีข้อความเก่ากว่านี้ให้โหลด */
  hasOlder: boolean;
  onLoadOlder: () => void;
  admins: Admin[];
  onBack: () => void;
  onSend: (text: string) => void;
  onRetry: (messageId: string) => void;
  onStatusChange: (status: ConversationStatus) => void;
  onAssign: (adminId: string | null) => void;
  onToggleInfo: () => void;
}

export function ChatWindow({ conversation, messages, loadingMessages, hasOlder, onLoadOlder, admins, onBack, onSend, onRetry, onStatusChange, onAssign, onToggleInfo }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const name = conversation.contact.displayName ?? "ไม่ทราบชื่อ";
  const adminName = (id: string | null) => admins.find((a) => a.id === id)?.name;

  // เลื่อนลงล่างเมื่อเปลี่ยนห้อง/มีข้อความใหม่ท้ายสุด (โหลดข้อความเก่าด้านบนไม่ต้องเลื่อน)
  const lastId = messages.at(-1)?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [conversation.id, lastId]);

  return (
    <section className="flex h-full min-h-0 flex-col bg-zinc-50">
      <header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-3 py-2.5 md:px-4">
        <button onClick={onBack} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 md:hidden" aria-label="กลับ">
          ←
        </button>
        <Avatar name={name} src={conversation.contact.pictureUrl} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-zinc-900">{name}</div>
        
        </div>
       
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-6">
        {hasOlder && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onLoadOlder}
              disabled={loadingMessages}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
            >
              {loadingMessages ? "กำลังโหลด…" : "โหลดข้อความก่อนหน้า"}
            </button>
          </div>
        )}
        {loadingMessages && messages.length === 0 && (
          <div className="py-6 text-center text-sm text-zinc-400">กำลังโหลดข้อความ…</div>
        )}
        {messages.map((m, i) => {
          const showDay = i === 0 || dayKey(messages[i - 1].createdAt) !== dayKey(m.createdAt);
          return (
            <Fragment key={m.id}>
              {showDay && (
                <div className="flex justify-center py-1">
                  <span className="rounded-full bg-zinc-200/70 px-3 py-0.5 text-xs text-zinc-600">{formatDayDivider(m.createdAt)}</span>
                </div>
              )}
              <MessageBubble m={m} senderName={adminName(m.senderAdminId)} onRetry={() => onRetry(m.id)} />
            </Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <Composer disabled={!conversation.contact.isFollowing} onSend={onSend} />
    </section>
  );
}
