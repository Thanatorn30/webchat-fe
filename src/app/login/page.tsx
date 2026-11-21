import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ · Web chat",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="เข้าสู่ระบบ"
      subtitle="หน้าแชตแอดมิน LINE OA"
      footer={
        <>
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-medium text-emerald-700 hover:underline">
            สมัครสมาชิก
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
