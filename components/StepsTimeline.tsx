"use client";

import { useEffect, useRef, useState } from "react";
import StepIcon from "@/components/StepIcon";
import { parseStep, type Heat } from "@/app/recipe/steps";

const heatLabels: Record<Heat, string> = { 1: "ไฟอ่อน", 2: "ไฟกลาง", 3: "ไฟแรง" };
const FLAME = "M12 3c3 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 3 2 3-4z";
const CHECK = "M5 12l5 5 9-10";

// วิธีทำ as a vertical timeline: done steps shrink, the current one opens into a big glanceable card.
// Built for a phone propped on the counter: big text, one big button, screen kept awake.
export default function StepsTimeline({ steps, onFinish }: { steps: string[]; onFinish: () => void }) {
  const parsed = steps.map((s, i) => parseStep(s, i));
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);
  const follow = useRef(false);
  const last = current === steps.length - 1;

  // Follow the current step after the user moves, never on page load.
  useEffect(() => {
    if (!follow.current) return;
    follow.current = false;
    cardRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [current]);

  function go(i: number) {
    follow.current = true;
    setCurrent(i);
  }

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

  function next() {
    setDone(new Set(done).add(current));
    if (last) onFinish();
    else go(current + 1);
  }

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">วิธีทำ</h3>
        <span className="text-sm font-medium text-muted">{done.size} จาก {steps.length} เสร็จแล้ว</span>
      </div>

      <ol className="relative flex flex-col gap-1 before:absolute before:top-4 before:bottom-4 before:left-[22.5px] before:w-[3px] before:rounded-full before:bg-edge">
        {parsed.map((p, i) => {
          if (i === current) {
            return (
              <li key={i} aria-current="step" className="relative">
                <div ref={cardRef} className="my-1 rounded-3xl bg-white p-4 shadow-card">
                  <div className="flex h-28 items-center justify-center rounded-2xl bg-butter-soft">
                    <StepIcon icon={p.icon} className="h-[72px] w-[72px]" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-muted">ขั้นที่ {i + 1}</p>
                  <p className="text-[26px] leading-tight font-bold">{p.verb}</p>
                  {p.detail && <p className="mt-1 text-lg text-muted">{p.detail}</p>}
                  {(p.heat || p.minutes) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.heat && (
                        <span className="flex min-h-9 items-center gap-1 rounded-full bg-mist px-3 text-sm font-semibold">
                          {[1, 2, 3].map((n) => (
                            <svg key={n} aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${n > p.heat! ? "opacity-25" : ""}`}>
                              <path d={FLAME} />
                            </svg>
                          ))}
                          <span className="ml-1">{heatLabels[p.heat]}</span>
                        </span>
                      )}
                      {p.minutes && <Timer minutes={p.minutes} />}
                    </div>
                  )}
                </div>
              </li>
            );
          }
          const isDone = done.has(i);
          return (
            <li key={i} className="relative">
              <button type="button" onClick={() => go(i)} className="flex min-h-14 w-full items-center gap-3 text-left">
                <span
                  className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isDone ? "bg-brand text-white" : "bg-white text-muted ring-2 ring-edge ring-inset"}`}
                >
                  {isDone ? (
                    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d={CHECK} />
                    </svg>
                  ) : (
                    <span className="font-semibold">{i + 1}</span>
                  )}
                </span>
                <span className="text-muted">
                  <span className="sr-only">{isDone ? "เสร็จแล้ว: " : `ขั้นที่ ${i + 1}: `}</span>
                  {p.verb} {isDone && p.detail}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-0 -mx-4 mt-4 rounded-t-3xl bg-white p-4 shadow-card">
        <button type="button" onClick={next} className="btn-primary min-h-14 w-full text-lg">
          {last ? "เสร็จแล้ว ให้คะแนนเมนูนี้" : "ขั้นต่อไป"}
        </button>
      </div>
    </section>
  );
}

// Tap to start, tap to pause. Remounted per step (keyed by the parent), so switching steps resets it.
function Timer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          navigator.vibrate?.(400);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  if (left === 0) {
    return (
      <span aria-live="polite" className="flex min-h-9 items-center rounded-full bg-butter px-3 text-sm font-semibold">
        ⏱ ครบเวลาแล้ว
      </span>
    );
  }
  const started = left < minutes * 60;
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  return (
    <button type="button" onClick={() => setRunning(!running)} className="flex min-h-11 items-center rounded-full bg-butter px-4 text-sm font-semibold">
      ⏱ {running ? mmss : started ? `${mmss} · ต่อ` : `${minutes} นาที · เริ่ม`}
    </button>
  );
}
