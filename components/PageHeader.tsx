import Link from "next/link";

export default function PageHeader({ title }: { title: string }) {
  return (
    // Opaque wrapper so scrolled content doesn't show through the rounded corners.
    <div className="sticky top-0 z-10 bg-mist">
      <header className="flex h-14 items-center gap-1 rounded-b-3xl bg-brand px-2 text-white shadow-card">
        <Link href="/" aria-label="กลับหน้าหลัก" className="-ml-1 flex h-11 w-11 items-center justify-center rounded-full active:bg-brand-deep">
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        {/* Bold 20px counts as large text, so white on brand passes contrast. */}
        <h1 className="text-xl font-bold">{title}</h1>
      </header>
    </div>
  );
}
