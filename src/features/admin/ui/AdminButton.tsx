import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "../utils/classNames";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variants = {
  danger: "border border-[#f2caca] bg-[#fff6f5] text-[#c62828] hover:bg-[#fff0ef]",
  ghost: "bg-transparent text-[#4b6384] hover:bg-[#edf3ff]",
  primary: "border border-[#1454c8] bg-[#1454c8] text-white shadow-[0_8px_18px_rgba(20,84,200,0.18)] hover:bg-[#0f49b4]",
  secondary: "border border-[#d8e3f5] bg-white text-[#07183f] hover:bg-[#f7faff]",
};

const sizes = {
  md: "h-10 px-4 text-sm",
  sm: "h-9 px-3 text-xs",
};

export function AdminButton({ children, className, icon, size = "md", type = "button", variant = "secondary", ...props }: AdminButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
