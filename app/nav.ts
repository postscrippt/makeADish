"use client";

// Keeps the pages visited in this session so the header shows a back button only when there is a previous step.
// A page opened straight from the chat (rich menu, carousel, confirm card) is the bottom of the stack: no back button, LINE's own X closes it.
import { useSyncExternalStore } from "react";

const stack: string[] = [];
const listeners = new Set<() => void>();

export function recordPath(path: string) {
  if (stack.at(-1) === path) return;
  if (stack.at(-2) === path) stack.pop(); // went back
  else stack.push(path);
  listeners.forEach((f) => f());
}

export const canGoBackNow = () => stack.length > 1;

export function useCanGoBack(): boolean {
  return useSyncExternalStore(
    (f) => {
      listeners.add(f);
      return () => listeners.delete(f);
    },
    canGoBackNow,
    () => false, // server render: no back button, so hydration matches
  );
}
