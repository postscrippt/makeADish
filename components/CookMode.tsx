"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CloseToChat from "@/components/CloseToChat";
import StepIcon from "@/components/StepIcon";
import { useDialog } from "@/components/useDialog";
import { parseStep, type Heat } from "@/app/recipe/steps";
import { stepIngredients } from "@/app/recipe/stepIngredients";
import { secondsLeft } from "@/app/recipe/timer";
import type { HistoryEntry, RecipeIngredient } from "@/types/api";

type Rating = HistoryEntry["rating"];

const heatLabels: Record<Heat, string> = { 1: "ไฟอ่อน", 2: "ไฟกลาง", 3: "ไฟแรง" };
// One simple flame. Lit: filled in the flame colour with a butter core. Off: an empty outline, so the level reads as a gauge.
const FLAME = "M12 2.5c.7 3.4 5.2 5.6 5.2 10.6a5.2 5.2 0 0 1-10.4 0c0-1.9.8-3.1 1.7-4.2.3 1.5 1 2.3 1.9 2.5C10.2 8.6 10.7 5.4 12 2.5z";
const CORE = "M12 19.4a2.1 2.1 0 0 1-2.1-2.1c0-1 .7-1.6 2.1-3 1.4 1.4 2.1 2 2.1 3a2.1 2.1 0 0 1-2.1 2.1z";

// Full-screen cooking: one step at a time. A pinned action band (icon, verb, heat), a card with the instruction, the
// timer and what the step uses, then the list of all steps (done, current, next). The bottom bar is just back and next.
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

  useDialog(rootRef, () => onExit(step)); // focus in, Escape leaves (the step is remembered), Tab stays inside

  // Each step starts at the top of the scrolling part.
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
            {/* Same zones, same order, on every step; the action band is pinned above the scrolling part. Cards hug their content; the free height below belongs to the step list,
                so the screen is full of orientation (what is done, what is next) instead of blank space. */}
          <div className="flex min-h-[6.2rem] shrink-0 items-center gap-4 px-5 pt-4 pb-3">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-butter-soft">
              <StepIcon icon={p.icon} className="h-10 w-10" />
            </span>
            {/* The verb and, when the step uses the stove, its heat right under it: the heat belongs to the action. */}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[2.125rem] leading-tight font-bold">{p.verb}</h2>
              {p.heat && (
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-flame-deep">
                  <span aria-hidden className="flex">
                    {[1, 2, 3].map((n) => (
                      <svg key={n} viewBox="0 0 24 24" strokeLinejoin="round" className="h-6 w-6">
                        {n <= p.heat! ? (
                          <>
                            <path d={FLAME} className="fill-flame stroke-flame" strokeWidth="1.8" />
                            <path d={CORE} className="fill-butter" />
                          </>
                        ) : (
                          <path d={FLAME} fill="none" className="stroke-muted/40" strokeWidth="1.6" />
                        )}
                      </svg>
                    ))}
                  </span>
                  {heatLabels[p.heat]}
                </p>
              )}
            </div>
          </div>

            <main ref={mainRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-1 pb-4">
              <section className="flex shrink-0 flex-col gap-4 rounded-3xl bg-white p-5 shadow-card">
                <p className="text-[1.375rem] leading-relaxed text-ink">{p.detail || steps[step]}</p>
                {/* Keyed by step, so each step gets its own fresh timer. */}
                {p.minutes && <Timer key={step} minutes={p.minutes} />}
                {used.length > 0 && (
                  <div className="border-t border-edge pt-3">
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

              {/* From the current step on: what you are on, what is left, and the end (rating). Steps done are one tap back on ‹. */}
              <section aria-label="ขั้นตอนที่เหลือ" className="flex-1">
                <ol className="flex flex-col gap-1">
                  {parsed.slice(step).map((q, k) => {
                    const i = step + k;
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => setStep(i)}
                          aria-current={i === step ? "step" : undefined}
                          aria-label={`ไปขั้นที่ ${i + 1}: ${q.verb}`}
                          className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left ${i === step ? "bg-white shadow-card" : ""}`}
                        >
                          <span aria-hidden className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${i === step ? "bg-butter text-ink" : "text-muted ring-2 ring-edge ring-inset"}`}>
                            {i + 1}
                          </span>
                          <span className={`min-w-0 flex-1 truncate ${i === step ? "font-semibold text-ink" : "text-ink"}`}>
                            {q.verb}{i !== step && <span className="font-normal text-muted"> {q.detail}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  <li className="flex min-h-14 items-center gap-3 px-3 text-muted">
                    <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 ring-edge ring-inset">★</span>
                    เสร็จแล้ว ให้คะแนนเมนู
                  </li>
                </ol>
              </section>
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
                className={`h-14 w-14 text-5xl ${rating && n <= rating ? "text-amber-600" : "text-muted"}`}
              >
                {rating && n <= rating ? "★" : "☆"}
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

  const tile = "flex min-h-16 shrink-0 items-center justify-between gap-3 rounded-2xl bg-butter px-5 py-2";
  if (left === 0) {
    return (
      <p aria-live="polite" className={tile}>
        <span className="text-2xl font-bold">ครบเวลาแล้ว</span>
      </p>
    );
  }
  const running = endAt !== null;
  const started = left < minutes * 60;
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  return (
    <button type="button" onClick={toggle} className={tile}>
      <span className="text-4xl leading-none font-bold tabular-nums">{mmss}</span>
      <span className="text-right text-sm font-medium">{running ? "แตะเพื่อพัก" : started ? "แตะเพื่อไปต่อ" : "แตะเพื่อจับเวลา"}</span>
    </button>
  );
}
