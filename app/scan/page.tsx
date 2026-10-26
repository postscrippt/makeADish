"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { scan } from "@/mocks/api";
import { writeDraft } from "@/app/draft";
import type { ScanResult } from "@/types/api";

type Failure = Extract<ScanResult, { ok: false }>["reason"];

const failureText: Record<Failure, string> = {
  no_food: "ไม่พบวัตถุดิบในรูปนี้ ลองถ่ายให้เห็นวัตถุดิบชัด ๆ อีกครั้ง",
  blurry: "รูปเบลอเกินไป ลองถือให้นิ่งแล้วถ่ายใหม่",
  error: "สแกนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
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
      const result = await scan(photo);
      if (!result.ok) return setFailure(result.reason);
      writeDraft("ingredients", result.ingredients);
      router.push("/form"); // leaving the page drops the photo and its preview
    } catch {
      setFailure("error");
    } finally {
      setScanning(false);
    }
  }

  const button = "flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl text-base font-medium";

  return (
    <>
      <PageHeader title="สแกนวัตถุดิบ" />
      <main className="flex flex-col gap-4 p-4">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50">
          {photo && preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimisable asset
            <img src={preview} alt="รูปวัตถุดิบที่เลือก" className="h-full w-full object-cover" />
          ) : (
            <p className="px-6 text-center text-sm text-zinc-500">
              ถ่ายรูปวัตถุดิบในครัวของคุณ
              <br />
              วางให้เห็นครบในรูปเดียว
            </p>
          )}
          {scanning && (
            <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-transparent" />
              <span className="text-sm">กำลังอ่านวัตถุดิบ…</span>
            </div>
          )}
        </div>

        {failure && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {failureText[failure]}
          </p>
        )}

        <div className="flex gap-3">
          <label className={`${button} border border-zinc-300`}>
            ถ่ายรูป
            <input type="file" accept="image/*" capture="environment" onChange={pick} disabled={scanning} className="sr-only" />
          </label>
          <label className={`${button} border border-zinc-300`}>
            เลือกจากคลังภาพ
            <input type="file" accept="image/*" onChange={pick} disabled={scanning} className="sr-only" />
          </label>
        </div>

        <button
          type="button"
          onClick={runScan}
          disabled={!photo || scanning}
          className="min-h-12 rounded-xl bg-line text-base font-semibold text-zinc-900 disabled:bg-zinc-200 disabled:text-zinc-400"
        >
          {failure ? "ลองสแกนอีกครั้ง" : "สแกน"}
        </button>

        <p className="text-center text-xs text-zinc-500">รูปจะถูกลบทันทีหลังสแกน ไม่มีการเก็บไว้</p>

        <Link href="/form" className="flex min-h-11 items-center justify-center text-sm text-zinc-600 underline">
          ข้าม ไปเพิ่มวัตถุดิบเอง
        </Link>
      </main>
    </>
  );
}
