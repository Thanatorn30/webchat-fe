"use client";

import { useState, type SubmitEvent } from "react";
import type { Admin, AdminRole } from "@/types/chat";
import { createAdmin } from "@/lib/api/admins";
import { ApiError } from "@/lib/api/client";

// กติกาเดียวกับ parseBody ใน webchat-be src/controllers/admins.ts
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<"email" | "name", string>>;

function validate(email: string, name: string): FieldErrors {
  const errors: FieldErrors = {};
  const e = email.trim();
  const n = name.trim();
  if (!e) errors.email = "กรุณากรอกอีเมล";
  else if (!EMAIL_RE.test(e) || e.length > 255) errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  if (!n) errors.name = "กรุณากรอกชื่อ";
  else if (n.length > 100) errors.name = "ชื่อยาวได้ไม่เกิน 100 ตัวอักษร";
  return errors;
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return "อีเมลนี้มีแอดมินใช้อยู่แล้ว";
    if (err.status === 400) return `ข้อมูลไม่ถูกต้อง: ${err.message}`;
    return `สร้างแอดมินไม่สำเร็จ (${err.status}): ${err.message}`;
  }
  return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง";
}

const inputClass =
  "w-full rounded-lg border bg-zinc-50 px-3 py-2 text-[15px] outline-none focus:border-emerald-500 focus:bg-white";

export function CreateAdminForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminRole>("agent");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Admin | null>(null);

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validate(email, name);
    setFieldErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const admin = await createAdmin({ email: email.trim(), name: name.trim(), role });
      setCreated(admin);
      setEmail("");
      setName("");
      setRole("agent");
    } catch (err) {
      setSubmitError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {created && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          สร้างแอดมิน <b>{created.name}</b> ({created.email}) เรียบร้อยแล้ว
        </div>
      )}
      {submitError && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-zinc-700">
          อีเมล
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          aria-invalid={!!fieldErrors.email}
          className={`${inputClass} ${fieldErrors.email ? "border-rose-400" : "border-zinc-200"}`}
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="admin-name" className="mb-1 block text-sm font-medium text-zinc-700">
          ชื่อ
        </label>
        <input
          id="admin-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          placeholder="ชื่อที่แสดงในหน้าแชต"
          aria-invalid={!!fieldErrors.name}
          className={`${inputClass} ${fieldErrors.name ? "border-rose-400" : "border-zinc-200"}`}
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>}
      </div>

      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-zinc-700">สิทธิ์</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "agent", label: "Agent", desc: "ตอบแชตลูกค้า" },
              { value: "owner", label: "Owner", desc: "จัดการแอดมินได้" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-lg border px-3 py-2 ${
                role === opt.value ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={opt.value}
                checked={role === opt.value}
                onChange={() => setRole(opt.value)}
                className="sr-only"
              />
              <div className="text-sm font-semibold text-zinc-900">{opt.label}</div>
              <div className="text-xs text-zinc-500">{opt.desc}</div>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="h-10 w-full rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {submitting ? "กำลังสร้าง…" : "สร้างแอดมิน"}
      </button>
    </form>
  );
}
