import type { ReactNode } from "react";

/** กรอบการ์ดกลางจอสำหรับหน้า login / register */
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white">
            W
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">{children}</div>
        <p className="mt-4 text-center text-sm text-zinc-500">{footer}</p>
      </div>
    </main>
  );
}

export function Field({
  id,
  label,
  error,
  ...input
}: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        className={`w-full rounded-lg border bg-zinc-50 px-3 py-2 text-[15px] outline-none focus:border-emerald-500 focus:bg-white ${
          error ? "border-rose-400" : "border-zinc-200"
        }`}
        {...input}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}

export function SubmitButton({ pending, children, pendingText }: { pending: boolean; children: ReactNode; pendingText: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
    >
      {pending ? pendingText : children}
    </button>
  );
}
