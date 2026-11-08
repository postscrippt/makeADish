// One wording for "can I cook this now?", shared by the web dish card and the chat dish card
// so the two surfaces never drift apart. Which dishes count as ready or missing is decided in
// plain code (lib/match.ts); this only turns that result into words. No % is shown.
import type { RecipeMatch } from "../types/api.ts";

export const READY_LABEL = "ทำได้เลย";

export function dishStatus(m: Pick<RecipeMatch, "missing">): { ready: true; label: string } | { ready: false; label: string; missing: string } {
  if (m.missing.length === 0) return { ready: true, label: READY_LABEL };
  return { ready: false, label: `ขาด ${m.missing.length} อย่าง`, missing: m.missing.map((x) => x.th).join(", ") };
}
