"use client";

import { useMemo, useState } from "react";
import type { Conversation, ConversationStatus } from "@/types/chat";
import { formatListTime } from "@/lib/format";
import { Avatar } from "./Avatar";

const tabs: { key: ConversationStatus; label: string }[] = [
  { key: "open", label: "เปิดอยู่" },
  { key: "pending", label: "รอดำเนินการ" },
  { key: "closed", label: "ปิดแล้ว" },
];

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect, onDelete }: Props) {
  const [status, setStatus] = useState<ConversationStatus>("open");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<ConversationStatus, number> = { open: 0, pending: 0, closed: 0 };
    for (const conv of conversations) c[conv.status]++;
    return c;
  }, [conversations]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations
      .filter((c) => c.status === status)
      .filter((c) => !q || (c.contact.displayName ?? "").toLowerCase().includes(q) || (c.lastMessagePreview ?? "").toLowerCase().includes(q))
      .sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
  }, [conversations, status, query]);

  return (
    <section className="flex h-full min-h-0 flex-col border-r border-zinc-200 bg-white">
      <header className="space-y-3 border-b border-zinc-200 p-4">
        <h1 className="text-lg font-semibold text-zinc-900">แชต LINE OA</h1>
       
      
      </header>

      <ul className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 && <li className="p-6 text-center text-sm text-zinc-400">ไม่มีห้องแชต</li>}
        {items.map((c) => {
          const name = c.contact.displayName ?? "ไม่ทราบชื่อ";
          const active = c.id === selectedId;
          return (
            <li key={c.id} className="border-b border-[#dddddd] flex flex-col items-end  px-4 py-3">
              {/* chat */}
              <button
                onClick={() => onSelect(c.id)}
                className={`flex w-full items-center gap-3 text-left transition `}
              >
                <Avatar name={name} src={c.contact.pictureUrl} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`truncate ${c.unreadCount ? "font-semibold text-zinc-900" : "font-medium text-zinc-800"}`}>{name}</span>
                    <span className="shrink-0 text-xs text-zinc-400">{formatListTime(c.lastMessageAt)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className={`truncate text-sm ${c.unreadCount ? "text-zinc-800" : "text-zinc-500"}`}>
                      {!c.contact.isFollowing && <span className="mr-1 text-rose-500">[บล็อก]</span>}
                      {c.lastMessagePreview}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
             {/* action */}
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                className="w-[50px] rounded-xl border border-red-500 p-1 text-red-600 transition hover:bg-red-50"
                aria-label={`ลบห้องแชต ${name}`}
                title="ลบห้องแชต"
              >
                ลบ
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
