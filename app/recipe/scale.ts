// Scales the leading number in a display quantity ("1 1/2 ช้อนโต๊ะ", "3-5 เม็ด").
// Text with no leading number ("ตามชอบ") is returned unchanged. Display only, never used for matching.
const NUM = String.raw`(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)`;
const LEADING = new RegExp(String.raw`^${NUM}(?:\s*-\s*${NUM})?`);

function parse(n: string): number {
  return n
    .trim()
    .split(/\s+/)
    .reduce((sum, part) => {
      const [a, b] = part.split("/").map(Number);
      return sum + (b ? a / b : a);
    }, 0);
}

function format(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;
  const fractions: [number, string][] = [[0.25, "1/4"], [0.333, "1/3"], [0.5, "1/2"], [0.667, "2/3"], [0.75, "3/4"]];
  const near = fractions.find(([v]) => Math.abs(frac - v) < 0.04);
  if (near) return whole ? `${whole} ${near[1]}` : near[1];
  return String(Math.round(n * 10) / 10);
}

export function scaleQty(qty: string, factor: number): string {
  if (factor === 1) return qty;
  return qty.replace(LEADING, (_, a: string, b?: string) =>
    b ? `${format(parse(a) * factor)}-${format(parse(b) * factor)}` : format(parse(a) * factor),
  );
}
