import type { Message } from "@/types/chat";
import { formatTime } from "@/lib/format";

function MessageBody({ m }: { m: Message }) {
  switch (m.type) {
    case "text":
      return <p className="whitespace-pre-wrap break-words">{m.text}</p>;
    case "image":
      if (m.mediaStatus === "pending")
        return <div className="flex h-40 w-56 animate-pulse items-center justify-center rounded-lg bg-zinc-200 text-xs text-zinc-500">กำลังดาวน์โหลดรูป…</div>;
      if (m.mediaStatus === "failed")
        return <div className="flex h-40 w-56 items-center justify-center rounded-lg bg-rose-50 text-xs text-rose-600">โหลดรูปไม่สำเร็จ</div>;
      return m.mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.mediaUrl} alt="รูปจากลูกค้า" className="max-h-72 w-56 rounded-lg object-cover" />
      ) : (
        <div className="flex h-40 w-56 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-300 text-xs text-zinc-600">🖼 รูปภาพ</div>
      );
    case "sticker":
      return <div className="text-5xl leading-none">🧸</div>;
    case "location": {
      const p = (m.payload ?? {}) as { title?: string; address?: string };
      return (
        <div className="w-56">
          <div className="text-sm font-medium">📍 {p.title ?? "ตำแหน่ง"}</div>
          <div className="text-xs opacity-75">{p.address}</div>
        </div>
      );
    }
    default:
      return <p className="italic opacity-75">[{m.type}]</p>;
  }
}

function SendState({ m, onRetry }: { m: Message; onRetry?: () => void }) {
  if (m.direction !== "out") return null;
  if (m.sendStatus === "queued") return <span className="text-zinc-400">กำลังส่ง…</span>;
  if (m.sendStatus === "failed")
    return (
      <span className="text-rose-600">
        ส่งไม่สำเร็จ{" "}
        <button onClick={onRetry} className="font-medium underline underline-offset-2 hover:text-rose-700">
          ส่งใหม่
        </button>
      </span>
    );
  return <span className="text-zinc-400">ส่งแล้ว</span>;
}

export function MessageBubble({ m, senderName, onRetry }: { m: Message; senderName?: string; onRetry?: () => void }) {
  const out = m.direction === "out";
  const bare = m.type === "sticker" || (m.type === "image" && !m.isUnsent);

  if (m.isUnsent) {
    return (
      <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
        <div className="rounded-2xl border border-dashed border-zinc-300 px-3 py-2 text-sm italic text-zinc-400">
          ลูกค้ายกเลิกข้อความนี้ · {formatTime(m.createdAt)}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${out ? "items-end" : "items-start"}`}>
      {out && senderName && <span className="mb-0.5 px-1 text-[11px] text-zinc-400">{senderName}</span>}
      <div className={`flex max-w-[75%] items-end gap-1.5 ${out ? "flex-row-reverse" : ""}`}>
        <div
          className={
            bare
              ? ""
              : `rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed ${
                  out
                    ? `rounded-br-md text-white ${m.sendStatus === "failed" ? "bg-emerald-600/60" : "bg-emerald-600"}`
                    : "rounded-bl-md bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                }`
          }
        >
          <MessageBody m={m} />
        </div>
        <div className={`flex shrink-0 flex-col pb-0.5 text-[11px] leading-tight ${out ? "items-end" : "items-start"}`}>
          <SendState m={m} onRetry={onRetry} />
          <span className="text-zinc-400">{formatTime(m.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
