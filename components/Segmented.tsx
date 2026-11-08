// Two-way switch between lists on one page (Results: can cook / need to buy; History: cooked / favourites).
// Plain toggle buttons with aria-pressed: the list below is the same region either way, so the ARIA tab
// pattern (tabpanels, arrow keys) would promise more than the page does.
export default function Segmented<T extends string>({
  label, options, value, onChange,
}: { label: string; options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 rounded-full bg-white p-1 shadow-card">
      {options.map(([id, text]) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`min-h-11 rounded-full text-sm font-medium ${value === id ? "bg-butter text-ink" : "text-muted"}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
