"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CloseToChat from "@/components/CloseToChat";
import StepIcon from "@/components/StepIcon";
import { parseStep, type Heat } from "@/app/recipe/steps";
import { secondsLeft } from "@/app/recipe/timer";
import type { HistoryEntry } from "@/types/api";

type Rating = HistoryEntry["rating"];

const heatLabels: Record<Heat, string> = { 1: "ไฟอ่อน", 2: "ไฟกลาง", 3: "ไฟแรง" };
const FLAME = "M12 3c3 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 3 2 3-4z";

// Full-screen cooking: one big step at a time, a tappable step bar and big prev/next buttons at the bottom,
// then the rating. Built for a phone propped on the counter; the screen is kept awake.
// onExit(step) leaves cook mode and remembers the step, so reopening it resumes there.
export default function CookMode({
  name, steps, startAt, onExit, onSave,
}: {
  name: string; steps: string[]; startAt: number; onExit: (step: number) => void; onSave: (rating: Rating) => Promise<void>;
}) {
  const parsed = steps.map((s, i) => parseStep(s, i));
  const [step, setStep] = useState(Math.min(startAt, steps.length - 1));
  const [finished, setFinished] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const last = step === steps.length - 1;
  const p = parsed[step];

  // Keep the screen on while cooking; unsupported browsers just skip it.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = () => {
      if (document.visibilityState !== "visible") return;
      navigator.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {});
    };
    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      document.removeEventListener("visibilitychange", request);
      lock?.release().catch(() => {});
    };
  }, []);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  // A long step is scrolled inside its card; the next one should start at the top.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [step]);

  return (
    <div className="fixed inset-0 z-30 flex justify-center bg-brand">
      <div ref={rootRef} role="dialog" aria-modal="true" aria-label={`ทำ ${name}`} tabIndex={-1} className="flex h-dvh w-full max-w-[430px] flex-col bg-mist outline-none">
        <header className="flex h-14 shrink-0 items-center gap-1 rounded-b-3xl bg-brand px-2 text-white shadow-card">
          <button type="button" onClick={() => onExit(step)} aria-label="ออกจากโหมดทำอาหาร" className="-ml-1 flex h-11 w-11 items-center justify-center rounded-full text-2xl active:bg-brand-deep">
            ×
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold">{name}</h1>
          {!finished && <span className="pr-3 text-sm font-medium">ขั้นที่ {step + 1}/{steps.length}</span>}
        </header>

        {finished ? (
          <Finish onSave={onSave} onBack={() => onExit(step)} />
        ) : (
          <>
            <main ref={mainRef} className="flex-1 overflow-y-auto p-4">
              <div className="rounded-3xl bg-white p-4 shadow-card">
                <div className="flex h-36 items-center justify-center rounded-2xl bg-butter-soft">
                  <StepIcon icon={p.icon} className="h-24 w-24" />
                </div>
                <p className="mt-4 text-[32px] leading-tight font-bold">{p.verb}</p>
                {p.detail && <p className="mt-2 text-xl leading-relaxed text-muted">{p.detail}</p>}
                {(p.heat || p.minutes) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.heat && (
                      <span className="flex min-h-11 items-center gap-1 rounded-full bg-mist px-4 font-semibold">
                        {[1, 2, 3].map((n) => (
                          <svg key={n} aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${n > p.heat! ? "opacity-25" : ""}`}>
                            <path d={FLAME} />
                          </svg>
                        ))}
                        <span className="ml-1">{heatLabels[p.heat]}</span>
                      </span>
                    )}
                    {/* Keyed by step, so each step gets its own fresh timer. */}
                    {p.minutes && <Timer key={step} minutes={p.minutes} />}
                  </div>
                )}
              </div>
            </main>

            <div className="shrink-0 rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-card">
              <ol aria-label="ขั้นตอนทั้งหมด" className="mb-3 flex gap-1">
                {parsed.map((q, i) => (
                  <li key={i} className="flex-1">
                    <button type="button" onClick={() => setStep(i)} aria-label={`ไปขั้นที่ ${i + 1}: ${q.verb}`} aria-current={i === step ? "step" : undefined} className="flex h-6 w-full items-center">
                      <span className={`h-2 w-full rounded-full ${i < step ? "bg-brand" : i === step ? "bg-butter ring-2 ring-brand" : "bg-edge"}`} />
                    </button>
                  </li>
                ))}
              </ol>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="ขั้นก่อนหน้า" className="btn-secondary min-h-14 px-6 text-lg disabled:opacity-40">
                  ‹
                </button>
                <button type="button" onClick={() => (last ? setFinished(true) : setStep(step + 1))} className="btn-primary min-h-14 flex-1 text-lg">
                  {last ? "เสร็จแล้ว" : "ขั้นต่อไป"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// After the last step: stars, save to History, then one way out. Saving is optional.
function Finish({ onSave, onBack }: { onSave: (rating: Rating) => Promise<void>; onBack: () => void }) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  async function save() {
    if (!rating) return;
    setFailed(false);
    try {
      await onSave(rating);
      setSaved(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto p-6 text-center">
      <p className="text-5xl" aria-hidden>🍽️</p>
      {saved ? (
        <>
          <h2 className="text-2xl font-bold">บันทึกลงประวัติแล้ว</h2>
          <div className="flex w-full flex-col gap-3">
            <CloseToChat className="btn-primary min-h-14 w-full text-lg" />
            <Link href="/history" className="btn-secondary w-full">ดูประวัติ</Link>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold">อร่อยแค่ไหน?</h2>
          <div role="radiogroup" aria-label="ให้คะแนน" className="flex gap-1">
            {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} ดาว`}
                onClick={() => setRating(n)}
                className={`h-14 w-14 text-5xl ${rating && n <= rating ? "text-amber-400" : "text-edge"}`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="flex w-full flex-col gap-3">
            <button type="button" onClick={save} disabled={!rating} className="btn-primary min-h-14 w-full text-lg">
              บันทึก
            </button>
            <button type="button" onClick={onBack} className="min-h-11 text-sm text-muted underline">
              ไม่ให้คะแนน กลับไปที่สูตร
            </button>
          </div>
          {failed && <p role="alert" className="text-sm text-red-700">บันทึกไม่สำเร็จ ลองกดบันทึกอีกครั้ง</p>}
        </>
      )}
    </main>
  );
}

// Tap to start, tap to pause. Counts toward a fixed end time, so it stays right after the phone pauses the page in the background.
function Timer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState(minutes * 60);
  const [endAt, setEndAt] = useState<number | null>(null);

  useEffect(() => {
    if (endAt === null) return;
    const tick = () => setLeft(secondsLeft(endAt, Date.now()));
    const id = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [endAt]);

  // Time's up: stop and buzz once.
  useEffect(() => {
    if (left > 0 || endAt === null) return;
    setEndAt(null); // eslint-disable-line react-hooks/set-state-in-effect
    navigator.vibrate?.(400);
  }, [left, endAt]);

  function toggle() {
    if (endAt === null) setEndAt(Date.now() + left * 1000);
    else {
      setLeft(secondsLeft(endAt, Date.now()));
      setEndAt(null);
    }
  }

  if (left === 0) {
    return (
      <span aria-live="polite" className="flex min-h-11 items-center rounded-full bg-butter px-4 font-semibold">
        ⏱ ครบเวลาแล้ว
      </span>
    );
  }
  const running = endAt !== null;
  const started = left < minutes * 60;
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  return (
    <button type="button" onClick={toggle} className="flex min-h-11 items-center rounded-full bg-butter px-4 font-semibold">
      ⏱ {running ? mmss : started ? `${mmss} · ต่อ` : `${minutes} นาที · เริ่ม`}
    </button>
  );
}
