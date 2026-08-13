import type { ReactNode } from "react";

interface PageFrameProps {
  actions?: ReactNode;
  children: ReactNode;
  subtitle?: string;
  title: string;
}

export function PageFrame({ actions, children, subtitle, title }: PageFrameProps) {
  return (
    <main className="admin-scrollbar min-w-0 flex-1 overflow-y-auto bg-[#f5f7fb] p-5 xl:p-7">
      <div className="mb-5 flex flex-col items-start justify-between gap-4 2xl:flex-row 2xl:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.01em] text-[#07183f] xl:text-2xl">{title}</h2>
          {subtitle ? <p className="mt-1 max-w-3xl text-sm font-medium text-[#62728b]">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex w-full flex-wrap items-center gap-2 2xl:w-auto 2xl:justify-end">{actions}</div> : null}
      </div>
      {children}
    </main>
  );
}
