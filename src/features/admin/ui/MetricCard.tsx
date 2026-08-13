import { classNames } from "../utils/classNames";
import { Icon } from "./Icon";

interface MetricCardProps {
  color: string;
  context?: string;
  delta: string;
  icon?: string;
  label: string;
  value: string;
}

export function MetricCard({ color, context, delta, icon = "file", label, value }: MetricCardProps) {
  return (
    <article className="rounded-[14px] border border-[#dfe7f2] bg-white p-5 shadow-[0_1px_2px_rgba(7,24,63,0.04)] transition hover:border-[#c8d5e8] hover:shadow-[0_10px_24px_rgba(7,24,63,0.06)]">
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}14`, color }}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <span
          className={classNames(
            "rounded-full px-2.5 py-1 text-[11px] font-bold",
            delta.startsWith("-") ? "bg-[#fff0ef] text-[#ee0f1a]" : "bg-[#ecfaef] text-[#00a86b]",
          )}
        >
          {delta}
        </span>
      </div>
      <p className="mt-5 text-2xl font-bold leading-none text-[#07183f]">{value}</p>
      <p className="mt-2 text-sm font-semibold text-[#62728b]">{label}</p>
      {context ? <p className="mt-1 text-xs font-medium text-[#8b9ab0]">{context}</p> : null}
    </article>
  );
}
