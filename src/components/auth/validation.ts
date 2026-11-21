import { ApiError } from "@/lib/api/client";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN = 8;

export function validateEmail(email: string): string | undefined {
  const e = email.trim();
  if (!e) return "กรุณากรอกอีเมล";
  if (!EMAIL_RE.test(e) || e.length > 255) return "รูปแบบอีเมลไม่ถูกต้อง";
}

/** แปลง error จาก API เป็นข้อความภาษาไทย (ข้อความเฉพาะตาม status ส่งมาใน map) */
export function apiErrorMessage(err: unknown, byStatus: Record<number, string> = {}): string {
  if (err instanceof ApiError) {
    if (byStatus[err.status]) return byStatus[err.status];
    if (err.status === 404) return "เซิร์ฟเวอร์ยังไม่รองรับการเข้าสู่ระบบ";
    return `เกิดข้อผิดพลาด (${err.status}): ${err.message}`;
  }
  return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง";
}
