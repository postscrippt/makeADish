// − value + control, used for servings.
export default function Stepper({
  value,
  onChange,
  min = 1,
  max = 12,
  unit,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  unit: string;
}) {
  const button =
    "h-11 w-11 rounded-full border-[1.5px] border-brand bg-white text-xl text-brand-deep active:bg-mist disabled:border-edge disabled:text-edge";
  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label="ลดจำนวน" disabled={value <= min} onClick={() => onChange(value - 1)} className={button}>
        −
      </button>
      <span aria-live="polite" className="w-14 text-center font-medium">
        {value} {unit}
      </span>
      <button type="button" aria-label="เพิ่มจำนวน" disabled={value >= max} onClick={() => onChange(value + 1)} className={button}>
        +
      </button>
    </div>
  );
}
