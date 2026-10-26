import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl" aria-hidden>🥢</p>
      <h1 className="text-lg font-semibold">ไม่พบหน้านี้</h1>
      <Link href="/" className="btn-primary">
        กลับหน้าหลัก
      </Link>
    </main>
  );
}
