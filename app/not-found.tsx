import CloseToChat from "@/components/CloseToChat";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl" aria-hidden>🥢</p>
      <h1 className="text-lg font-semibold">ไม่พบหน้านี้</h1>
      <p className="text-sm text-muted">ลองเปิดใหม่จากเมนูในแชท LINE นะ</p>
      <CloseToChat />
    </main>
  );
}
