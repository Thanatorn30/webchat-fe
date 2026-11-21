import type { Conversation } from "@/types/chat";
import { formatDate } from "@/lib/format";
import { Avatar } from "./Avatar";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-0.5 break-all text-sm text-zinc-800">{children}</dd>
    </div>
  );
}

export function ContactPanel({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const c = conversation.contact;
  const name = c.displayName ?? "ไม่ทราบชื่อ";
  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-zinc-200 bg-white">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <span className="font-semibold text-zinc-900">ข้อมูลลูกค้า</span>
        <button onClick={onClose} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100" aria-label="ปิด">
          ✕
        </button>
      </header>
      <div className="overflow-y-auto p-4">
        <div className="flex flex-col items-center gap-2 pb-4">
          <Avatar name={name} src={c.pictureUrl} size={72} />
          <div className="text-center font-semibold text-zinc-900">{name}</div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              c.isFollowing ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {c.isFollowing ? "เป็นเพื่อนอยู่" : "บล็อก / เลิกเป็นเพื่อน"}
          </span>
        </div>
        <dl className="divide-y divide-zinc-100">
          <Row label="LINE userId">
            <code className="text-xs">{c.lineUserId}</code>
          </Row>
          <Row label="เพิ่มเพื่อนเมื่อ">{formatDate(c.followedAt)}</Row>
          {!c.isFollowing && <Row label="เลิกเป็นเพื่อนเมื่อ">{formatDate(c.unfollowedAt)}</Row>}
          <Row label="ทักครั้งแรก">{formatDate(c.createdAt)}</Row>
        </dl>
      </div>
    </aside>
  );
}
