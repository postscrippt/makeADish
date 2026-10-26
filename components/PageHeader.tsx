import Link from "next/link";

export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 flex h-12 items-center gap-2 bg-line px-3 text-zinc-900">
      <Link href="/" aria-label="กลับหน้าหลัก" className="p-2 text-xl leading-none">
        ‹
      </Link>
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
