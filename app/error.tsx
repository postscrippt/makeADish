"use client"; // error pages must run in the browser

import Link from "next/link";

// Shown when a page crashes while rendering. Failed data loads are handled on each page with its own message.
export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl" aria-hidden>🍳</p>
      <h1 className="text-lg font-semibold">มีบางอย่างผิดพลาด</h1>
      <p className="text-sm text-zinc-500">ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง</p>
      <button type="button" onClick={() => retry()} className="min-h-12 rounded-xl bg-line px-6 font-semibold text-zinc-900">
        ลองอีกครั้ง
      </button>
      <Link href="/" className="text-sm underline">กลับหน้าหลัก</Link>
    </main>
  );
}
