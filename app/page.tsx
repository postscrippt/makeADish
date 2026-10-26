import Link from "next/link";
import Image from "next/image";

// Line icons (24px grid, stroked) so tiles match the rich menu image.
const icons = {
  scan: "M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.5-2h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  history: "M12 21a9 9 0 1 0-9-9M3 12l-1-2.5M3 12l2.5-1.5M12 7v5l3 2",
  menus: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13zM7 8h1M16 8h1",
};

function Icon({ d, className }: { d: string; className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

// Mirrors the LINE rich menu: Scan is the big tile, the other two are rows. In LINE each opens its page directly.
const rows = [
  { href: "/history", icon: icons.history, label: "ประวัติ", hint: "เมนูที่เคยทำและเมนูโปรด" },
  { href: "/menus", icon: icons.menus, label: "เมนูทั้งหมด", hint: "ค้นหาสูตรอาหาร" },
];

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col pb-8">
      <header className="rounded-b-[2.5rem] bg-brand px-6 pb-20 pt-8 text-white">
        <p className="flex items-center gap-2 text-xl font-semibold">
          <Image src="/logo.svg" alt="" width={50} height={36} unoptimized priority />
          MakeADish
        </p>
        <h1 className="mt-10 text-4xl font-bold leading-tight text-butter">
          มีอะไรในครัว
          <br />
          ก็ทำได้
        </h1>
        <p className="mt-3 text-base">ถ่ายรูปวัตถุดิบ แล้วเราหาเมนูที่ทำได้ให้</p>
      </header>

      <nav aria-label="เมนูหลัก" className="-mt-12 flex flex-col gap-3 px-4">
        <Link href="/scan" className="flex items-center gap-4 rounded-3xl bg-butter p-5 shadow-card active:bg-butter-soft">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-brand-deep">
            <Icon d={icons.scan} className="h-8 w-8" />
          </span>
          <span className="flex-1">
            <span className="block text-2xl font-bold text-ink">สแกนวัตถุดิบ</span>
            <span className="block text-sm text-ink">ถ่ายรูปของในครัว แล้วหาเมนู</span>
          </span>
          <span aria-hidden className="text-3xl text-brand-deep">›</span>
        </Link>
        {rows.map(({ href, icon, label, hint }) => (
          <Link key={href} href={href} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card active:bg-butter-soft">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-butter text-ink">
              <Icon d={icon} className="h-6 w-6" />
            </span>
            <span className="flex-1">
              <span className="block text-lg font-semibold">{label}</span>
              <span className="block text-sm text-muted">{hint}</span>
            </span>
            <span aria-hidden className="text-2xl text-muted">›</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
