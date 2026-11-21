"use client";

import { useState, type KeyboardEvent } from "react";

export function Composer({ disabled, onSend }: { disabled: boolean; onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  const send = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter = ส่ง, Shift+Enter = ขึ้นบรรทัดใหม่ (ไม่ส่งระหว่างพิมพ์ภาษาไทยด้วย IME)
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  if (disabled) {
    return (
      <div className="border-t border-zinc-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">
        ลูกค้าบล็อกหรือเลิกเป็นเพื่อนกับ OA แล้ว จึงส่งข้อความหาไม่ได้
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 border-t border-zinc-200 bg-white p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="พิมพ์ข้อความ…"
        title="Enter เพื่อส่ง, Shift+Enter ขึ้นบรรทัดใหม่"
        className="max-h-40 min-h-10 flex-1 resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[15px] outline-none focus:border-emerald-500 focus:bg-white"
      />
      <button
        type="button"
        onClick={send}
        disabled={!text.trim()}
        className="h-10 shrink-0 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        ส่ง
      </button>
    </div>
  );
}
