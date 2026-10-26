import Link from "next/link";

// Mirrors the LINE rich menu tiles; in LINE each tile opens one of these pages directly.
const tiles = [
  { href: "/scan", icon: "📷", label: "สแกนวัตถุดิบ", hint: "ถ่ายรูปของในครัว" },
  { href: "/history", icon: "🕘", label: "ประวัติ", hint: "เมนูที่เคยทำ" },
  { href: "/menus", icon: "📖", label: "เมนูทั้งหมด", hint: "ค้นหาสูตร" },
  { href: "/ask", icon: "💬", label: "ถามผู้ช่วย", hint: "ถามเรื่องทำอาหาร" },
];

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="bg-line px-5 pb-8 pt-10 text-zinc-900">
        <h1 className="text-3xl font-bold">AI Menu</h1>
        <p className="mt-1">มีอะไรในครัว ก็ทำได้</p>
      </header>
      <nav aria-label="เมนูหลัก" className="-mt-4 grid grid-cols-2 gap-3 px-4">
        {tiles.map(({ href, icon, label, hint }) => (
          <Link
            key={href}
            href={href}
            className="flex aspect-square flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm active:bg-zinc-50"
          >
            <span aria-hidden className="text-4xl">{icon}</span>
            <span>
              <span className="block text-lg font-semibold">{label}</span>
              <span className="block text-sm text-zinc-500">{hint}</span>
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
