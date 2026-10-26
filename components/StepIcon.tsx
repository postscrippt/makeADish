import type { StepIcon as Kind } from "@/app/recipe/steps";

// Stroked line icons (24px grid) for the kind of action in a cooking step.
const paths: Record<Kind, string> = {
  whisk: "M5 10h14l-1.5 8a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7zM14 4l-3 7",
  pan: "M3 12h13v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM16 13h5M7 8c0-1 1-1 1-2.5M11 8c0-1 1-1 1-2.5",
  pot: "M5 9h14v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM3 9h18M9 5h6",
  steam: "M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6zM3 11h18M8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3M16 7c0-1.5 1-1.5 1-3",
  knife: "M4 20L15.5 8.5M14 4l6 6-4.5 4.5-6-6zM4 20l3-1",
  mortar: "M4 11h16a8 8 0 0 1-16 0zM14 11l5-7M9 20h6",
  add: "M5 10h14l-1.5 8a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7zM12 2v5M9.5 4.5L12 7l2.5-2.5",
  season: "M8 4h8M9 4v3l-2 3v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-9l-2-3V4M10 13h4",
  plate: "M3 15h18M5 15a7 7 0 0 1 14 0M12 8V6M2 18h20",
  generic: "M7 18h10v2H7zM7 18v-5a4 4 0 1 1 3-6.5 4 4 0 0 1 4 0A4 4 0 1 1 17 13v5",
};

export default function StepIcon({ icon, className }: { icon: Kind; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={paths[icon]} />
    </svg>
  );
}
