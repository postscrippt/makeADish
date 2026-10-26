import Link from "next/link";

export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 flex h-12 items-center gap-1 bg-line px-2 text-zinc-900">
      <Link href="/" aria-label="กลับหน้าหลัก" className="-ml-1 flex h-11 w-11 items-center justify-center text-2xl leading-none">
        ‹
      </Link>
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
