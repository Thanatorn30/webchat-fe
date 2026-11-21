"use client";

/** popup แจ้งให้รีเฟรช เมื่อโหลดข้อมูลไม่สำเร็จหรือนานเกินไป (DB ของ free tier หลับอยู่) */
export function DbAsleepDialog({ onClose }: { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="db-asleep-title"
        className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"
      >
        <div className="mb-2 text-3xl" aria-hidden>
          😴
        </div>
        <h2 id="db-asleep-title" className="mb-1 text-base font-semibold text-zinc-800">
          กดรีเฟรชอีกครั้ง
        </h2>
        <p className="mb-5 text-sm text-zinc-500">
          เนื่องจาก DB หลับไหล — ระบบกำลังปลุกฐานข้อมูล กรุณารีเฟรชหน้านี้อีกครั้ง
        </p>
        <div className="flex justify-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              ปิด
            </button>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            รีเฟรช
          </button>
        </div>
      </div>
    </div>
  );
}
