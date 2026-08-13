import type { InputHTMLAttributes } from "react";

import { Icon } from "./Icon";

export function SearchField({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex h-10 min-w-[240px] items-center gap-3 rounded-xl border border-[#d8e3f5] bg-white px-3 text-sm text-[#7b8faa] ${className}`}>
      <Icon name="search" className="h-4 w-4" />
      <input className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#07183f] outline-none placeholder:text-[#9aacc5]" {...props} />
    </label>
  );
}
