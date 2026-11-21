"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken, subscribeToken } from "@/lib/session";

/**
 * ครอบหน้าที่ต้อง login — ถ้าไม่มี token (หรือ token หมดอายุ) จะดีดไปหน้า /login
 * พร้อมแนบ ?next=<path เดิม> เพื่อให้ login เสร็จแล้วกลับมาหน้าเดิม
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // ฝั่ง server / ตอน hydrate ยังไม่รู้ token → undefined (แสดง loading)
  const token = useSyncExternalStore<string | null | undefined>(subscribeToken, getToken, () => undefined);

  useEffect(() => {
    if (token === null) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [token, pathname, router]);

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500" role="status">
        กำลังตรวจสอบการเข้าสู่ระบบ…
      </div>
    );
  }

  return <>{children}</>;
}
