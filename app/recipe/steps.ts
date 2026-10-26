// Turns a recipe step sentence into glanceable parts for the วิธีทำ timeline.
// shortcut: keyword table over Thai text; swap for structured step fields once Person B adds them to the recipe data.
export type StepIcon = "whisk" | "pan" | "pot" | "steam" | "knife" | "mortar" | "add" | "season" | "plate" | "generic";
export type Heat = 1 | 2 | 3;
export type ParsedStep = { verb: string; detail: string; icon: StepIcon; heat: Heat | null; minutes: number | null };

// Longest first, so "ปรุงรส" wins over "ปรุง".
const VERBS: [string, StepIcon][] = (
  [
    ["ปรุงรส", "season"], ["ปรุง", "season"], ["หมัก", "season"],
    ["ปิดไฟ", "pot"], ["ต้ม", "pot"], ["เคี่ยว", "pot"], ["ลวก", "pot"],
    ["ตี", "whisk"], ["ผสม", "whisk"], ["คลุก", "whisk"], ["คน", "whisk"], ["ตอก", "whisk"], ["ยี", "whisk"],
    ["ผัด", "pan"], ["ทอด", "pan"], ["เจียว", "pan"], ["ตั้ง", "pan"],
    ["นึ่ง", "steam"],
    ["หั่น", "knife"], ["ซอย", "knife"], ["สับ", "knife"],
    ["โขลก", "mortar"],
    ["ใส่", "add"], ["เท", "add"], ["เติม", "add"], ["ราด", "add"], ["โรย", "add"],
    ["ตัก", "plate"], ["เสิร์ฟ", "plate"],
  ] as [string, StepIcon][]
).sort((a, b) => b[0].length - a[0].length);

function heatOf(text: string): Heat | null {
  if (text.includes("ไฟอ่อน")) return 1;
  if (text.includes("ไฟกลาง")) return 2;
  if (text.includes("ไฟแรง") || text.includes("ร้อนจัด")) return 3;
  return null;
}

export function parseStep(text: string, index: number): ParsedStep {
  const heat = heatOf(text);
  const m = text.match(/(\d+)\s*นาที/);
  const minutes = m ? Number(m[1]) : null;
  const hit = VERBS.find(([word]) => text.startsWith(word));
  if (!hit) return { verb: `ขั้นที่ ${index + 1}`, detail: text, icon: "generic", heat, minutes };
  return { verb: hit[0], detail: text.slice(hit[0].length).trim(), icon: hit[1], heat, minutes };
}
