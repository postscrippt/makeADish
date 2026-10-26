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
  const on = danger ? "border-red-600 bg-red-50 text-red-700" : "border-butter bg-butter text-ink";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-10 shrink-0 rounded-full border-[1.5px] px-4 text-sm font-medium ${selected ? on : "border-edge bg-white text-muted"}`}
    >
      {children}
    </button>
  );
}
