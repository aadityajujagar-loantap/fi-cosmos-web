import { Icon } from "./Icon";

interface EmptyStateProps {
  action?: string;
  onAction?: () => void;
  subtitle: string;
  title: string;
}

export function EmptyState({ action, onAction, subtitle, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#c8d5e8] bg-[#f8fafd] px-6 py-10 text-center">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-white text-[#1454c8] shadow-sm">
        <Icon name="search" className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-bold text-[#07183f]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#62728b]">{subtitle}</p>
      {action ? (
        <button onClick={onAction} type="button" className="mt-4 rounded-xl border border-[#d8e3f5] bg-white px-4 py-2 text-sm font-bold text-[#1454c8]">
          {action}
        </button>
      ) : null}
    </div>
  );
}
