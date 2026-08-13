import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "../utils/classNames";

interface PanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

interface PanelHeaderProps {
  actions?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}

export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <section className={classNames("rounded-[14px] border border-[#dfe7f2] bg-white shadow-[0_1px_2px_rgba(7,24,63,0.04)]", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({ actions, eyebrow, subtitle, title }: PanelHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-[#edf1f7] px-5 py-4">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8b9ab0]">{eyebrow}</p> : null}
        <h3 className="text-sm font-bold text-[#07183f]">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs font-medium text-[#62728b]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
