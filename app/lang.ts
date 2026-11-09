"use client";

// Which language the web pages show. Chat text stays Thai and is not touched by this.
// The choice is kept on the phone only (localStorage), never in the profile.
import { useSyncExternalStore } from "react";
import { getLiff } from "./liff.ts";
import { t, type Key, type Lang, type Vars } from "./text.ts";

const KEY = "makeadish.lang";
let current: Lang = "th";
let started = false;
const listeners = new Set<() => void>();

// A saved choice wins, then the first language we could detect. Thai otherwise.
export function pickLang(saved: string | null, ...detected: (string | null | undefined)[]): Lang {
  if (saved === "th" || saved === "en") return saved;
  return detected.find(Boolean)?.toLowerCase().startsWith("en") ? "en" : "th";
}

function readSaved(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null; // storage blocked: the switch still works until the page reloads
  }
}

function apply(next: Lang) {
  if (next === current) return;
  current = next;
  document.documentElement.lang = next;
  listeners.forEach((f) => f());
}

export function setLang(next: Lang) {
  try {
    localStorage.setItem(KEY, next);
  } catch {}
  apply(next);
}

// Runs once, after the first page has mounted (the server always renders Thai, so hydration matches).
function start() {
  if (started) return;
  started = true;
  const saved = readSaved();
  apply(pickLang(saved, navigator.language)); // no wait for the first paint; LINE's language replaces it below
  if (saved) return;
  getLiff()
    .then((liff) => {
      if (!readSaved()) apply(pickLang(null, liff?.getLanguage(), navigator.language)); // the user may have tapped the switch meanwhile
    })
    .catch(() => {});
}

function subscribe(f: () => void) {
  listeners.add(f);
  start();
  return () => {
    listeners.delete(f);
  };
}

const bound = {
  th: (key: Key, vars?: Vars) => t(key, "th", vars),
  en: (key: Key, vars?: Vars) => t(key, "en", vars),
};

export function useLang() {
  const lang = useSyncExternalStore(subscribe, () => current, (): Lang => "th");
  return { lang, t: bound[lang] };
}
