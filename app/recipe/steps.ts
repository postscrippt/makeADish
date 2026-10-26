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
    ["นำ", "add"], ["ตำ", "mortar"], ["บุบ", "mortar"], ["หุง", "pot"], ["อบ", "pot"], ["แช่", "pot"],
    ["ย่าง", "pan"], ["ปิ้ง", "pan"], ["คั่ว", "pan"],
  ] as [string, StepIcon][]
).sort((a, b) => b[0].length - a[0].length);

// Linking words that often open a step ("จากนั้นใส่…"); the verb comes after them.
const FILLER = /^(จากนั้น|แล้ว|ต่อมา|สุดท้าย)\s*/;

// Earliest time to check: "2-3 นาที" → 2, "1 ชั่วโมง 30 นาที" → 90. Seconds are too short for a timer.
function minutesOf(text: string): number | null {
  const h = text.match(/(\d+)\s*ชั่วโมง/);
  const m = text.match(/(\d+)(?:\s*-\s*\d+)?\s*นาที/);
  if (!h && !m) return null;
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

function heatOf(text: string): Heat | null {
  if (text.includes("ไฟอ่อน")) return 1;
  if (text.includes("ไฟกลาง")) return 2;
  if (text.includes("ไฟแรง") || text.includes("ร้อนจัด")) return 3;
  return null;
}

export function parseStep(text: string, index: number): ParsedStep {
  const heat = heatOf(text);
  const minutes = minutesOf(text);
  const core = text.replace(FILLER, "");
  const hit = VERBS.find(([word]) => core.startsWith(word));
  if (!hit) return { verb: `ขั้นที่ ${index + 1}`, detail: text, icon: "generic", heat, minutes };
  return { verb: hit[0], detail: core.slice(hit[0].length).trim(), icon: hit[1], heat, minutes };
}
