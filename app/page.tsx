import Link from "next/link";

const pages = [
  { href: "/scan", label: "สแกนวัตถุดิบ" },
  { href: "/form", label: "เลือกเงื่อนไข" },
  { href: "/results", label: "ผลลัพธ์" },
  { href: "/recipe/1", label: "สูตรอาหาร" },
  { href: "/history", label: "ประวัติ" },
  { href: "/menus", label: "เมนูทั้งหมด" },
];

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="mb-1 text-2xl font-bold">AI Menu</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Dev index. In LINE these open from the rich menu.
      </p>
      <ul className="space-y-2">
        {pages.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="block rounded-lg border border-zinc-200 px-4 py-3 active:bg-zinc-100"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
