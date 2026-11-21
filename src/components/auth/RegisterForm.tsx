"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth";
import { setToken } from "@/lib/session";
import { Field, FormAlert, SubmitButton } from "./AuthShell";
import { PASSWORD_MIN, apiErrorMessage, validateEmail } from "./validation";

type Errors = Partial<Record<"email" | "name" | "password", string>>;

/** ฟอร์มสมัคร — POST /api/auth/register { email, name, password } */
export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = name.trim();
    const next: Errors = {
      email: validateEmail(email),
      name: !n ? "กรุณากรอกชื่อ" : n.length > 100 ? "ชื่อยาวได้ไม่เกิน 100 ตัวอักษร" : undefined,
      password: password.length < PASSWORD_MIN ? `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN} ตัวอักษร` : undefined,
    };
    setErrors(next);
    setSubmitError(null);
    if (Object.values(next).some(Boolean)) return;

    setPending(true);
    try {
      const { token } = await register({ email: email.trim().toLowerCase(), name: n, password });
      setToken(token);
      router.replace("/");
    } catch (err) {
      setSubmitError(apiErrorMessage(err, { 409: "อีเมลนี้ถูกใช้สมัครแล้ว" }));
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormAlert message={submitError} />
      <Field
        id="reg-email"
        name="email"
        label="อีเมล"
        type="email"
        autoComplete="email"
        placeholder="admin@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Field
        id="reg-name"
        name="name"
        label="ชื่อ"
        autoComplete="name"
        maxLength={100}
        placeholder="ชื่อที่แสดงในหน้าแชต"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <Field
        id="reg-password"
        name="password"
        label="รหัสผ่าน"
        type="password"
        autoComplete="new-password"
        placeholder={`อย่างน้อย ${PASSWORD_MIN} ตัวอักษร`}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <SubmitButton pending={pending} pendingText="กำลังสมัคร…">
        สมัครสมาชิก
      </SubmitButton>
    </form>
  );
}
