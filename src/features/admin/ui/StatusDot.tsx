import { classNames } from "../utils/classNames";

export function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={classNames("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold", active ? "bg-[#ecfaef] text-[#07883a]" : "bg-[#fff8eb] text-[#b77900]")}>
      <span className={classNames("h-2 w-2 rounded-full", active ? "bg-[#07883a]" : "bg-[#b77900]")} />
      {label}
    </span>
  );
}
