import type { Metadata } from "next";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CreateAdminForm } from "@/components/admins/CreateAdminForm";

export const metadata: Metadata = {
  title: "เพิ่มแอดมิน · Web chat",
};

export default function NewAdminPage() {
  return (
    <AuthGuard>
      <main className="flex min-h-full items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
            ← กลับหน้าแชต
          </Link>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-zinc-900">เพิ่มแอดมิน</h1>
            <p className="mb-5 mt-1 text-sm text-zinc-500">สร้างบัญชีแอดมินสำหรับตอบแชต LINE OA</p>
            <CreateAdminForm />
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
