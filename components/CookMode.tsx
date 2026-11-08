"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import CloseToChat from "@/components/CloseToChat";
import StepIcon from "@/components/StepIcon";
import { parseStep, type Heat } from "@/app/recipe/steps";
import { stepIngredients } from "@/app/recipe/stepIngredients";
import { secondsLeft } from "@/app/recipe/timer";
import type { HistoryEntry, RecipeIngredient } from "@/types/api";

type Rating = HistoryEntry["rating"];

const heatLabels: Record<Heat, string> = { 1: "ไฟอ่อน", 2: "ไฟกลาง", 3: "ไฟแรง" };
const FLAME = "M12 3c3 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 3 2 3-4z";

// Full-screen cooking: one step at a time. The step card grows to fill the screen; under it come what the step uses
// (with amounts), heat and a big timer, and a preview of the next step. The bottom bar is just back and next.
// Then the rating. Built for a phone propped on the counter; the screen is kept awake.
// onExit(step) leaves cook mode and remembers the step, so reopening it resumes there.
export default function CookMode({
  name, steps, ingredients, startAt, onExit, onSave,
}: {
  name: string; steps: string[]; ingredients: RecipeIngredient[]; startAt: number; onExit: (step: number) => void; onSave: (rating: Rating) => Promise<void>;
}) {
  const parsed = steps.map((s, i) => parseStep(s, i));
  const [step, setStep] = useState(Math.min(startAt, steps.length - 1));
  const [finished, setFinished] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const last = step === steps.length - 1;
  const p = parsed[step];
  const next = parsed[step + 1];
  const used = stepIngredients(steps[step], ingredients);

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
          {!finished && <span aria-label={`ขั้นที่ ${step + 1} จาก ${steps.length}`} className="pr-3 text-sm font-medium">{step + 1}/{steps.length}</span>}
        </header>

        {finished ? (
          <Finish onSave={onSave} onBack={() => onExit(step)} />
        ) : (
          <>
            <ol aria-label="ขั้นตอนทั้งหมด" className="flex shrink-0 gap-1 px-4 pt-2">
              {parsed.map((q, i) => (
                <li key={i} className="flex-1">
                  <button type="button" onClick={() => setStep(i)} aria-label={`ไปขั้นที่ ${i + 1}: ${q.verb}`} aria-current={i === step ? "step" : undefined} className="flex h-6 w-full items-center">
                    <span className={`h-2 w-full rounded-full ${i < step ? "bg-brand" : i === step ? "bg-butter ring-2 ring-brand" : "bg-edge"}`} />
                  </button>
                </li>
              ))}
            </ol>

            {/* Fixed geometry, top to bottom, the same on every step: the action band (icon + verb + heat), the instruction card
                (its text is sized to fill the card), a timer tile only when the step has a time, the next-step strip. */}
            <main ref={mainRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-2 pb-4">
              <div className="flex shrink-0 items-center gap-4 px-1">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-butter">
                  <StepIcon icon={p.icon} className="h-10 w-10" />
                </span>
                <h2 className="min-w-0 flex-1 truncate text-[44px] leading-tight font-bold">{p.verb}</h2>
                {p.heat && (
                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <span className="flex gap-0.5">
                      {[1, 2, 3].map((n) => (
                        <svg key={n} aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-6 w-6 ${n > p.heat! ? "opacity-25" : ""}`}>
                          <path d={FLAME} />
                        </svg>
                      ))}
                    </span>
                    <span className="text-xs font-semibold">{heatLabels[p.heat]}</span>
                  </div>
                )}
              </div>

              <section className="flex min-h-[11rem] flex-1 flex-col rounded-3xl bg-white p-5 shadow-card">
                <FitText key={step}>{p.detail || steps[step]}</FitText>
                {used.length > 0 && (
                  <div className="mt-3 shrink-0 border-t border-edge pt-3">
                    <p className="mb-2 text-sm font-semibold text-muted">ใช้ในขั้นนี้</p>
                    <ul className="flex flex-wrap gap-2">
                      {used.map((x) => (
                        <li key={x.id} className="rounded-full bg-mist px-4 py-2 text-base">
                          <span className="font-semibold">{x.th}</span> <span className="text-muted">{x.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Keyed by step, so each step gets its own fresh timer. */}
              {p.minutes && <Timer key={step} minutes={p.minutes} />}

              <p className="flex min-h-14 shrink-0 items-center gap-3 rounded-2xl px-4 text-muted ring-1 ring-edge ring-inset">
                <span className="shrink-0 text-sm font-semibold">ต่อไป</span>
                <span className="min-w-0 flex-1 truncate">{next ? `${next.verb} ${next.detail}` : "เสร็จแล้ว ให้คะแนนเมนู"}</span>
              </p>
            </main>

            <div className="flex shrink-0 gap-2 rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-card">
              <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="ขั้นก่อนหน้า" className="btn-secondary min-h-14 px-6 text-lg disabled:opacity-40">
                ‹
              </button>
              <button type="button" onClick={() => (last ? setFinished(true) : setStep(step + 1))} className="btn-primary min-h-14 flex-1 text-lg">
                {last ? "เสร็จแล้ว" : "ขั้นต่อไป"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// The instruction, as big as fits: the largest size (22-52px) at which it still fits its box. A short step gets big type,
// a long one smaller, so the card is full either way and the text always starts at the same top-left corner.
function FitText({ children }: { children: string }) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    const b = box.current!;
    const t = text.current!;
    const fit = () => {
      let size = 52;
      t.style.fontSize = `${size}px`;
      while (size > 22 && t.offsetHeight > b.clientHeight) t.style.fontSize = `${(size -= 2)}px`;
    };
    fit();
    const watch = new ResizeObserver(fit);
    watch.observe(b);
    return () => watch.disconnect();
  }, [children]);
  return (
    <div ref={box} className="min-h-0 flex-1 overflow-hidden">
      <p ref={text} className="leading-snug text-pretty text-ink">{children}</p>
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

// A big tile: tap to start, tap to pause. Counts toward a fixed end time, so it stays right after the phone pauses the page in the background.
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

  const tile = "flex min-h-20 shrink-0 items-center justify-between gap-3 rounded-3xl bg-butter px-6 py-3 shadow-card";
  if (left === 0) {
    return (
      <p aria-live="polite" className={tile}>
        <span className="text-3xl font-bold">ครบเวลาแล้ว</span>
      </p>
    );
  }
  const running = endAt !== null;
  const started = left < minutes * 60;
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  return (
    <button type="button" onClick={toggle} className={tile}>
      <span className="text-5xl leading-none font-bold tabular-nums">{mmss}</span>
      <span className="text-right text-sm font-medium">{running ? "แตะเพื่อพัก" : started ? "แตะเพื่อไปต่อ" : "แตะเพื่อจับเวลา"}</span>
    </button>
  );
}
