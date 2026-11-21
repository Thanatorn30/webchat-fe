import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "สมัครสมาชิก · Web chat",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="สมัครสมาชิก"
      subtitle="สร้างบัญชีแอดมินสำหรับตอบแชต LINE OA"
      footer={
        <>
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
