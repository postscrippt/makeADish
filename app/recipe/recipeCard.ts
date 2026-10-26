// The recipe as a LINE Flex card, posted into the chat from the recipe page ("ส่งเข้าแชท" / "แชร์").
// A keepsake and shopping list; cooking itself happens on the page, which the "เริ่มทำ" button opens.
// Colors follow DESIGN.md. Cards sent from LIFF may only use link (URI) buttons.
import type { ChatMessage } from "../liff.ts";
import type { Recipe } from "../../types/api.ts";
import { parseStep } from "./steps.ts";

const C = { brand: "#09809d", brandDeep: "#066a82", ink: "#0b3a47", muted: "#4f6e78", amber: "#b45309", white: "#ffffff" };

const text = (t: string, extra: Record<string, unknown> = {}) => ({ type: "text", text: t, wrap: true, color: C.ink, size: "sm", ...extra });

export function recipeCard(recipe: Recipe, missingIds: string[], startUrl: string): ChatMessage {
  const missing = new Set(missingIds);
  const meta = `${recipe.minutes} นาที · สำหรับ ${recipe.baseServings} ที่${recipe.spice > 0 ? ` · ${"🌶".repeat(recipe.spice)}` : ""}`;

  const ingredients = recipe.ingredients.map((x) => ({
    type: "box",
    layout: "horizontal",
    contents: [
      text(missing.has(x.id) ? `${x.th} · ต้องซื้อ` : x.th, { flex: 3, ...(missing.has(x.id) && { color: C.amber, weight: "bold" }) }),
      text(x.qty, { flex: 2, align: "end", color: C.muted }),
    ],
  }));

  const steps = recipe.steps.map((s, i) => {
    const p = parseStep(s, i);
    return {
      type: "box",
      layout: "horizontal",
      spacing: "sm",
      contents: [text(`${i + 1}. ${p.verb}`, { flex: 0, weight: "bold" }), text(p.detail || " ", { flex: 1, color: C.muted })],
    };
  });

  const bubble = {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: C.brand,
      paddingAll: "lg",
      contents: [text(recipe.th, { size: "xl", weight: "bold", color: C.white }), text(meta, { color: C.white })],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        text("วัตถุดิบ", { size: "md", weight: "bold" }),
        ...ingredients,
        { type: "separator", margin: "lg" },
        text("วิธีทำ", { size: "md", weight: "bold", margin: "lg" }),
        ...steps,
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [{ type: "button", style: "primary", color: C.brandDeep, action: { type: "uri", label: "เริ่มทำ", uri: startUrl } }],
    },
  };

  return { type: "flex", altText: `สูตร${recipe.th}`, contents: bubble } as ChatMessage;
}
