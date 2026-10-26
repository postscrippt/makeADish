// Shared building blocks for LINE Flex messages, in the DESIGN.md palette (as hex, since LINE can't read CSS tokens).
export const C = {
  brand: "#09809d", brandDeep: "#066a82", ink: "#0b3a47", muted: "#4f6e78",
  butter: "#f6e39a", amber: "#b45309", red: "#b91c1c", white: "#ffffff",
};

export const text = (t: string, extra: Record<string, unknown> = {}) => ({ type: "text", text: t, wrap: true, color: C.ink, size: "sm", ...extra });

export const button = (action: Record<string, unknown>, primary = true) =>
  primary ? { type: "button", style: "primary", color: C.brandDeep, height: "sm", action } : { type: "button", style: "link", color: C.brandDeep, height: "sm", action };

// Teal header with a white title, like the app's PageHeader.
export const header = (title: string, sub?: string) => ({
  type: "box",
  layout: "vertical",
  backgroundColor: C.brand,
  paddingAll: "lg",
  contents: [text(title, { size: "lg", weight: "bold", color: C.white }), ...(sub ? [text(sub, { color: C.white })] : [])],
});

export const spiceMeta = (minutes: number, spice: number) => `${minutes} นาที${spice > 0 ? ` · ${"🌶".repeat(spice)}` : ""}`;
