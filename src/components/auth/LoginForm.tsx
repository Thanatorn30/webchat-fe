"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/session";
import { Field, FormAlert, SubmitButton } from "./AuthShell";
import { apiErrorMessage, validateEmail } from "./validation";

type Errors = Partial<Record<"email" | "password", string>>;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {
      email: validateEmail(email),
      password: password ? undefined : "กรุณากรอกรหัสผ่าน",
    };
    setErrors(next);
    setSubmitError(null);
    if (next.email || next.password) return;

    setPending(true);
    try {
      const { token } = await login({ email: email.trim().toLowerCase(), password });
      setToken(token);
      router.replace(safeNextPath());
    } catch (err) {
      setSubmitError(apiErrorMessage(err, { 401: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }));
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormAlert message={submitError} />
      <Field
        id="login-email"
        label="อีเมล"
        type="email"
        autoComplete="email"
        placeholder="admin@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Field
        id="login-password"
        label="รหัสผ่าน"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <SubmitButton pending={pending} pendingText="กำลังเข้าสู่ระบบ…">
        เข้าสู่ระบบ
      </SubmitButton>
    </form>
  );
}

/** อ่าน ?next= ที่ AuthGuard แนบมา — รับเฉพาะ path ภายในเว็บ กัน open redirect */
function safeNextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
