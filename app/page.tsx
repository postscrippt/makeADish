import Link from "next/link";
import Image from "next/image";
import CloseToChat from "@/components/CloseToChat";

// The app has no menu of its own: the LINE rich menu is the only one. This page is only seen when someone opens the bare site.
// In mock mode (no keys, outside LINE) it also lists the pages so the UI can still be walked end to end.
const MOCK_MODE = process.env.NEXT_PUBLIC_USE_MOCKS !== "false"; // same rule as mocks/api.ts

const devPages = [
  { href: "/scan", label: "สแกนวัตถุดิบ" },
  { href: "/history", label: "ประวัติ" },
  { href: "/menus", label: "เมนูทั้งหมด" },
];

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <Image src="/logo.svg" alt="" width={75} height={54} unoptimized priority />
      <h1 className="text-2xl font-bold">MakeADish</h1>
      <p className="text-muted">เปิดใช้งานจากแชท LINE ของเรา แล้วกด “สแกนวัตถุดิบ” ที่เมนูด้านล่าง</p>
      <CloseToChat className="btn-secondary">ปิด</CloseToChat>

      {MOCK_MODE && (
        <nav aria-label="หน้าสำหรับทดสอบ" className="mt-6 flex flex-col items-center gap-1 text-sm">
          <p className="text-muted">โหมดทดสอบ (mock)</p>
          {devPages.map((p) => (
            <Link key={p.href} href={p.href} className="flex min-h-11 items-center underline">
              {p.label}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
