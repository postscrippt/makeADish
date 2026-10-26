"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ask } from "@/mocks/api";
import type { ChatMessage } from "@/types/api";

const starters = ["มีไข่กับหมู ทำอะไรดี", "อยากกินต้มยำ", "มีกุ้ง ทำอะไรได้บ้าง"];

export default function AskPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, waiting]);

  async function send(history: ChatMessage[]) {
    setMessages(history);
    setWaiting(true);
    setFailed(false);
    try {
      const reply = await ask(history);
      setMessages([...history, reply]);
    } catch {
      setFailed(true);
    } finally {
      setWaiting(false);
    }
  }

  function submit(question: string) {
    const q = question.trim();
    if (!q || waiting) return;
    setText("");
    send([...messages, { role: "user", text: q }]);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="ถามผู้ช่วย" />
      <main className="flex flex-1 flex-col gap-3 p-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-zinc-500">ถามเรื่องทำอาหารได้เลย ผู้ช่วยตอบจากสูตรในระบบ</p>
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="min-h-10 rounded-full border border-zinc-300 px-4 text-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.role === "user" ? "self-end bg-line text-zinc-900" : "self-start bg-zinc-100"}`}
          >
            <p>{m.text}</p>
            {m.recipes && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.recipes.map((r) => (
                  <Link key={r.id} href={`/recipe/${r.id}`} className="rounded-full bg-white px-3 py-1 text-sm underline">
                    {r.th}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {waiting && (
          <p role="status" className="self-start rounded-2xl bg-zinc-100 px-4 py-2 text-zinc-500">
            กำลังพิมพ์…
          </p>
        )}
        {failed && (
          <div role="alert" className="self-start rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700">
            ตอบไม่สำเร็จ{" "}
            <button type="button" onClick={() => send(messages)} className="underline">
              ลองอีกครั้ง
            </button>
          </div>
        )}
        <div ref={endRef} />
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
        className="sticky bottom-0 flex gap-2 border-t border-zinc-200 bg-white p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="พิมพ์คำถาม…"
          aria-label="คำถาม"
          className="min-h-11 flex-1 rounded-full border border-zinc-300 px-4 text-base"
        />
        <button
          type="submit"
          disabled={!text.trim() || waiting}
          className="min-h-11 rounded-full bg-line px-5 font-semibold text-zinc-900 disabled:bg-zinc-200 disabled:text-zinc-400"
        >
          ส่ง
        </button>
      </form>
    </div>
  );
}
