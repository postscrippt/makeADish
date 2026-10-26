// Toggle button used for spice, category and allergy choices.
export default function Chip({
  selected,
  onClick,
  danger = false,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const on = danger ? "border-red-600 bg-red-50 text-red-700" : "border-line bg-line/10 text-zinc-900";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 text-sm ${selected ? on : "border-zinc-300 text-zinc-600"}`}
    >
      {children}
    </button>
  );
}
