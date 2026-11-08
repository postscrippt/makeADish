"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { getProfile, scan } from "@/mocks/api";
import { startSearch } from "@/app/draft";
import type { ScanResult } from "@/types/api";
import { shrinkPhoto } from "@/app/scan/shrink";

type Failure = Extract<ScanResult, { ok: false }>["reason"];

const failureText: Record<Failure, string> = {
  no_food: "ไม่พบวัตถุดิบในรูปนี้ ลองถ่ายให้เห็นวัตถุดิบชัด ๆ อีกครั้ง",
  blurry: "รูปเบลอเกินไป ลองถือให้นิ่งแล้วถ่ายใหม่",
  error: "สแกนไม่สำเร็จ ลองใหม่อีกครั้งนะ",
};

export default function ScanPage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  // The preview is an in-memory URL; release it when it is replaced or the page closes.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again after an error
    if (!file) return;
    setFailure(null);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function runScan() {
    if (!photo) return;
    setScanning(true);
    setFailure(null);
    try {
      // Shrink first: the API takes at most 5 MB, and a smaller upload is faster on mobile data.
      const result = await scan(await shrinkPhoto(photo));
      if (!result.ok) return setFailure(result.reason);
      // No separate "is this right?" page: Results lists what was found, with an edit button.
      startSearch(result.ingredients, await getProfile());
      router.push("/results"); // leaving the page drops the photo and its preview
    } catch {
      setFailure("error");
    } finally {
      setScanning(false);
    }
  }

  const picker = "btn-secondary flex-1 text-base focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-deep";
  return (
    // Column fills the screen so the scan bar sits at the bottom, like the other entry pages.
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="สแกนวัตถุดิบ">
        <h2 className="text-3xl leading-tight font-bold text-balance text-butter">ถ่ายวัตถุดิบให้เห็นครบ</h2>
      </PageHeader>
      <main className="flex flex-1 flex-col gap-5 px-5 pt-6 pb-8">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-white shadow-card">
          {photo && preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimisable asset
            <img src={preview} alt="รูปวัตถุดิบที่เลือก" className="h-full w-full object-cover" />
          ) : (
            <p className="px-6 text-center text-muted">วางวัตถุดิบให้เห็นครบในรูปเดียว</p>
          )}
          {scanning && (
            <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
              <span className="text-sm">กำลังอ่านวัตถุดิบ…</span>
            </div>
          )}
        </div>

        {failure && (
          <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {failureText[failure]}
          </p>
        )}

        <div className="flex gap-3">
          <label className={picker}>
            ถ่ายรูป
            <input type="file" accept="image/*" capture="environment" onChange={pick} disabled={scanning} className="sr-only" />
          </label>
          <label className={picker}>
            จากคลังภาพ
            <input type="file" accept="image/*" onChange={pick} disabled={scanning} className="sr-only" />
          </label>
        </div>

        <Link href="/form" className="flex min-h-11 items-center justify-center text-sm text-muted underline">
          หรือ พิมพ์วัตถุดิบเอง
        </Link>
      </main>

      <div className="sticky bottom-0 rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-card">
        <button type="button" onClick={runScan} disabled={!photo || scanning} className="btn-primary w-full text-base">
          {failure ? "ลองสแกนอีกครั้ง" : photo ? "สแกน" : "เลือกรูปก่อน"}
        </button>
        <p className="mt-3 text-center text-sm text-muted">เราไม่เก็บรูปไว้ และจะลบทิ้งทันทีหลังสแกน</p>
      </div>
    </div>
  );
}
