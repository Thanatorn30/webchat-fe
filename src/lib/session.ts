// เก็บ token หลัง login ไว้ใน localStorage (ฝั่ง client เท่านั้น)
const TOKEN_KEY = "webchat.token";
// event ภายในแท็บเดียวกัน (event "storage" ของ browser ยิงเฉพาะข้ามแท็บ)
const TOKEN_CHANGE_EVENT = "webchat:token-change";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token && isExpired(token)) {
    window.localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
}

/** subscribe การเปลี่ยนแปลง token ทั้งในแท็บนี้และแท็บอื่น — คืนฟังก์ชัน unsubscribe */
export function subscribeToken(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === TOKEN_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(TOKEN_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TOKEN_CHANGE_EVENT, callback);
  };
}

/** ถ้า token เป็น JWT ที่มี exp และหมดอายุแล้ว → true (token แบบอื่นถือว่ายังไม่หมดอายุ) */
function isExpired(token: string): boolean {
  const payload = token.split(".")[1];
  if (!payload) return false;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: unknown };
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}
