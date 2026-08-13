import { classNames } from "../utils/classNames";

interface SegmentedTabsProps<T extends string> {
  items: readonly T[];
  onChange: (item: T) => void;
  value: T;
}

export function SegmentedTabs<T extends string>({ items, onChange, value }: SegmentedTabsProps<T>) {
  return (
    <div className="inline-grid rounded-xl bg-[#edf3ff] p-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          type="button"
          className={classNames("rounded-lg px-3 py-2 text-xs font-bold transition", value === item ? "bg-white text-[#1454c8] shadow-sm" : "text-[#62728b] hover:text-[#07183f]")}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
