// Messages the LINE bot sends in the chat (docs/line-chat-flow.md, steps 2, 4 and 5).
// Person A owns the design; Person B's webhook calls these and sends the result as a reply (free, no quota).
// Pure functions, so they can run on the server and in tests. Preview: paste a message's JSON into LINE's Flex Message Simulator.
import type { Ingredient, SearchResult, RecipeMatch } from "../../types/api.ts";
import { C, button, header, spiceMeta, text } from "./flex.ts";

type LineMessage = Record<string, unknown>;

const MAX_DISHES = 10; // + one "see all" card stays under LINE's 12-bubble carousel limit

// Step 2: reply to the Scan tile. Quick-reply camera buttons open the camera right in the chat.
export function scanPrompt(formUrl: string): LineMessage {
  return {
    type: "text",
    text: "ถ่ายรูปวัตถุดิบในครัวได้เลย\nวางให้เห็นชัด ๆ จะหาเมนูได้แม่นขึ้น",
    quickReply: {
      items: [
        { type: "action", action: { type: "camera", label: "ถ่ายรูป" } },
        { type: "action", action: { type: "cameraRoll", label: "เลือกจากคลังภาพ" } },
        { type: "action", action: { type: "uri", label: "พิมพ์เอง", uri: formUrl } },
      ],
    },
  };
}

// One ingredient per line, in two columns, so names never break mid-word and are easy to check.
function ingredientColumns(ingredients: Pick<Ingredient, "th">[]) {
  const half = Math.ceil(ingredients.length / 2);
  const column = (list: Pick<Ingredient, "th">[]) => ({
    type: "box",
    layout: "vertical",
    spacing: "xs",
    contents: list.map((x) => text(`• ${x.th}`, { size: "md" })),
  });
  return { type: "box", layout: "horizontal", spacing: "md", contents: [column(ingredients.slice(0, half)), ...(ingredients.length > 1 ? [column(ingredients.slice(half))] : [])] };
}

// Step 4: after the scan. One tap to search; editing (chips, allergies) happens on the page.
export function confirmCard(
  ingredients: Pick<Ingredient, "id" | "th">[],
  prefs: { allergyNames: string[]; spiceLabel: string },
  editUrl: string,
  confirmData: string,
): LineMessage {
  const title = `เจอวัตถุดิบ ${ingredients.length} อย่าง`;
  // Allergies stay visible in red so the user always sees the safety filter that will apply.
  const prefsLine = {
    type: "box",
    layout: "horizontal",
    spacing: "xs",
    contents:
      prefs.allergyNames.length > 0
        ? [text(`แพ้: ${prefs.allergyNames.join(", ")}`, { flex: 0, color: C.red, weight: "bold" }), text(`· ${prefs.spiceLabel}`, { color: C.muted })]
        : [text(`ยังไม่ได้ระบุอาหารที่แพ้ · ${prefs.spiceLabel}`, { color: C.muted })],
  };
  return {
    type: "flex",
    altText: `${title} ถูกต้องไหม?`,
    contents: {
      type: "bubble",
      header: header(title, "ถูกต้องไหม?"),
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [ingredientColumns(ingredients), { type: "separator" }, prefsLine],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          button({ type: "postback", label: "ถูกต้อง หาเมนู", data: confirmData, displayText: "ถูกต้อง หาเมนู" }),
          button({ type: "uri", label: "แก้ไข", uri: editUrl }, false),
        ],
      },
    },
  };
}

function dishBubble(m: RecipeMatch, canMake: boolean, recipeUrl: string) {
  const r = m.recipe;
  return {
    type: "bubble",
    size: "kilo",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        text(canMake ? "ทำได้เลย" : "ขาดอีกนิด", { size: "xs", weight: "bold", color: canMake ? C.brandDeep : C.amber }),
        text(r.th, { size: "lg", weight: "bold" }),
        text(spiceMeta(r.minutes, r.spice), { color: C.muted }),
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              flex: 0,
              backgroundColor: C.butter,
              cornerRadius: "xxl",
              paddingStart: "md",
              paddingEnd: "md",
              paddingTop: "xs",
              paddingBottom: "xs",
              contents: [text(`ตรง ${m.matchPercent}%`, { size: "xs", weight: "bold" })],
            },
          ],
        },
        ...(m.missing.length > 0 ? [text(`ขาด: ${m.missing.map((x) => x.th).join(", ")}`, { color: C.amber })] : []),
      ],
    },
    footer: { type: "box", layout: "vertical", contents: [button({ type: "uri", label: "ดูสูตร", uri: recipeUrl })] },
  };
}

// Step 5: the results as swipeable cards. Input must come from the hard-filtered search (allergies, unknown
// allergen data already removed); this only lays it out. Tabs and food-type filters live on the page (allUrl).
export function resultsCarousel(result: SearchResult, recipeUrl: (id: string) => string, allUrl: string, editUrl: string): LineMessage {
  const all = [...result.matches.map((m) => [m, true] as const), ...result.almostThere.map((m) => [m, false] as const)];

  if (all.length === 0) {
    return {
      type: "flex",
      altText: "ไม่พบเมนูที่ตรงกับวัตถุดิบ",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [text("ไม่พบเมนูที่ตรงเงื่อนไข", { size: "md", weight: "bold" }), text("ลองเพิ่มวัตถุดิบดูนะ", { color: C.muted })],
        },
        footer: { type: "box", layout: "vertical", contents: [button({ type: "uri", label: "แก้วัตถุดิบ", uri: editUrl })] },
      },
    };
  }

  const seeAll = {
    type: "bubble",
    size: "kilo",
    body: {
      type: "box",
      layout: "vertical",
      justifyContent: "center",
      spacing: "sm",
      contents: [
        text(`ทั้งหมด ${all.length} เมนู`, { size: "lg", weight: "bold", align: "center" }),
        text("แยกแท็บ และกรองตามประเภทอาหาร", { color: C.muted, align: "center" }),
      ],
    },
    footer: { type: "box", layout: "vertical", contents: [button({ type: "uri", label: "ดูทั้งหมด", uri: allUrl }, false)] },
  };

  const canMake = result.matches.length;
  return {
    type: "flex",
    altText: canMake > 0 ? `เจอ ${canMake} เมนูที่ทำได้เลย` : `เจอ ${all.length} เมนูที่ขาดอีกนิด`,
    contents: {
      type: "carousel",
      contents: [...all.slice(0, MAX_DISHES).map(([m, ok]) => dishBubble(m, ok, recipeUrl(m.recipe.id))), seeAll],
    },
  };
}
